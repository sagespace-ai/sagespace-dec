import type {
  ApiResponse,
  ApiError,
  CreateFeedItemRequest,
  RemixRequest,
  RemixResponse,
  CreateCommentRequest,
  Comment,
  SearchFilters,
  SearchResponse,
} from "../types/api"
import type { FeedItem } from "../types"

const API_BASE_URL = import.meta.env.VITE_API_URL || ""

class ApiService {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
    console.log("[v0] API Service initialized with base URL:", baseUrl || "(demo mode - no API)")
  }

  private async getAuthToken(): Promise<string | null> {
    // Try to get token from Supabase session first
    if (typeof window !== "undefined") {
      // Check localStorage (synced by AuthContext)
      const storedToken = localStorage.getItem("auth_token")
      if (storedToken) {
        return storedToken
      }

      // Fallback: try to get from Supabase directly
      try {
        const { getAuthToken } = await import("../lib/supabase")
        const token = await getAuthToken()
        if (token) {
          localStorage.setItem("auth_token", token)
          return token
        }
      } catch {
        // Supabase not available, continue with null
      }
    }
    return null
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<{ data: T | null; error?: string }> {
    if (!this.baseUrl) {
      console.warn("[v0] API request to", endpoint, "blocked - running in demo mode")
      return {
        data: null,
        error: "Demo mode - API not configured. Please set VITE_API_URL environment variable.",
      }
    }

    // Wrap the request in retry logic for network errors
    const makeRequest = async (): Promise<ApiResponse<T>> => {
      try {
        const token = await this.getAuthToken()
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          ...((options.headers as Record<string, string>) || {}),
        }

        // Add auth token if available
        if (token) {
          headers["Authorization"] = `Bearer ${token}`
        }

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          ...options,
          headers,
        })

        // Check if response is actually JSON
        const contentType = response.headers.get("content-type") || ""
        const isJson = contentType.includes("application/json")

        if (!response.ok) {
          let errorMessage = response.statusText

          // Handle 404 specifically
          if (response.status === 404) {
            if (isJson) {
              try {
                const errorData = await response.json()
                errorMessage = errorData.error || errorData.message || "Resource not found"
              } catch {
                errorMessage = "Resource not found"
              }
            } else {
              errorMessage =
                "API endpoint not found. Please check that the endpoint exists and VITE_API_URL is configured correctly."
            }
          } else if (isJson) {
            try {
              const errorData = await response.json()
              errorMessage = errorData.error || errorData.message || response.statusText
            } catch {
              // If JSON parsing fails, use status text
            }
          } else {
            // Response is HTML (likely an error page)
            const text = await response.text()
            if (text.includes("<!doctype") || text.includes("<html")) {
              errorMessage = `API endpoint not found or server error (${response.status}). Please check your API configuration.`
            }
          }

          const error = new Error(errorMessage) as Error & { status?: number }
          error.status = response.status
          throw error
        }

        // Parse JSON response
        if (!isJson) {
          const text = await response.text()
          if (text.includes("<!doctype") || text.includes("<html")) {
            throw new Error(
              `API returned HTML instead of JSON. The endpoint may not exist or the API URL is incorrect.`,
            )
          }
          throw new Error(`Expected JSON response but received ${contentType}`)
        }

        const data = await response.json()
        return { data: data.data || data, ...data }
      } catch (error) {
        // Provide more helpful error messages
        let errorMessage = "Unknown error"

        if (error instanceof SyntaxError && error.message.includes("JSON")) {
          // JSON parsing error - likely got HTML instead
          errorMessage =
            "API returned invalid response. Please check that the API endpoint exists and VITE_API_URL is configured correctly."
        } else if (error instanceof TypeError && error.message.includes("fetch")) {
          // Network error or CORS issue
          if (this.baseUrl.includes("localhost")) {
            errorMessage = "API server not running. Please start the API server or configure VITE_API_URL."
          } else {
            errorMessage = "Unable to connect to API. Please check your network connection and API configuration."
          }
        } else if (error instanceof Error) {
          errorMessage = error.message
        }

        // Attach status for retry logic
        const apiError = Object.assign(new Error(errorMessage), {
          error: errorMessage,
          status: error instanceof TypeError ? 0 : (error as any).status,
        }) as ApiError
        throw apiError
      }
    }

    // Use retry for network errors, but not for 4xx errors
    try {
      return await makeRequest()
    } catch (error: any) {
      return {
        data: null as T,
        error: error.message || "Request failed",
      }
    }
  }

  // User endpoints
  async getMe() {
    return this.request("/me")
  }

  async updateMe(data: { name?: string; avatar?: string }) {
    return this.request("/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  // Legacy support
  async getUser(id: string) {
    return this.request(`/users/${id}`)
  }

  async updateUser(id: string, data: unknown) {
    return this.request(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  // Creation endpoints
  // Create with AI generation
  async createCreation(data: CreateFeedItemRequest): Promise<
    ApiResponse<{
      feedItem: FeedItem
      generatedContent?: {
        contentUrl?: string
        thumbnail?: string
        text?: string
      }
    }>
  > {
    return this.request("/create", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // Legacy: Direct feed item creation (without generation)
  async createCreationLegacy(data: CreateFeedItemRequest): Promise<ApiResponse<FeedItem>> {
    return this.request("/create", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async getCreations(userId?: string): Promise<ApiResponse<FeedItem[]>> {
    const endpoint = userId ? `/creations?userId=${userId}` : "/creations"
    return this.request(endpoint)
  }

  // Remix endpoints
  async remix(data: RemixRequest): Promise<ApiResponse<RemixResponse>> {
    return this.request("/remix", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // Feed endpoints
  async getFeed(
    cursor?: string,
    limit = 20,
    persona?: string,
    view?: "default" | "marketplace" | "universe" | "following",
  ) {
    const params = new URLSearchParams()
    if (cursor) params.append("cursor", cursor)
    params.append("limit", limit.toString())
    if (persona && persona.trim().length > 0) {
      params.append("persona", persona.trim())
    }
    if (view && view !== "default") {
      params.append("view", view)
    }
    const query = params.toString()
    return this.request(`/feed${query ? `?${query}` : ""}`)
  }

  async createFeedInteraction(data: {
    feed_item_id: string
    interaction_type: "like" | "comment" | "share" | "remix"
    content?: string
  }) {
    return this.request("/feed/interactions", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // Sage endpoints
  async getSages() {
    return this.request("/sages")
  }

  async createSage(data: {
    name: string
    role: string
    description: string
    avatar: string
    memory: "local" | "cross-session" | "global"
    autonomy: "advisory" | "semi-autonomous" | "autonomous"
    dataAccess: string
    color: string
  }) {
    return this.request("/sages", {
      method: "POST",
      body: JSON.stringify({
        ...data,
        data_access: data.dataAccess, // Transform to snake_case
      }),
    })
  }

  // Chat endpoint (new unified API)
  async chat(data: {
    message: string
    sageId: string
    conversationId?: string
    history?: Array<{ role: "user" | "assistant"; content: string }>
  }) {
    return this.request<{ reply: string; conversationId: string }>("/chat", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // Conversation endpoints
  async getConversations() {
    return this.request<
      Array<{
        id: string
        user_id: string
        sage_id: string
        title: string | null
        created_at: string
        updated_at: string
        sage?: {
          id: string
          name: string
          role: string
          avatar: string
        }
        message_count?: number
      }>
    >("/conversations")
  }

  async getConversation(conversationId: string) {
    return this.request<{
      id: string
      user_id: string
      sage_id: string
      title: string | null
      created_at: string
      updated_at: string
      sage?: {
        id: string
        name: string
        role: string
        avatar: string
      }
      messages: Array<{
        id: string
        conversation_id: string
        role: "user" | "assistant"
        content: string
        created_at: string
      }>
    }>(`/conversations/${conversationId}`)
  }

  async deleteConversation(conversationId: string) {
    return this.request(`/conversations/${conversationId}`, {
      method: "DELETE",
    })
  }

  // Legacy chat method (deprecated - use chat() instead)
  async chatWithSage(sageId: string, message: string) {
    return this.request(`/sages/${sageId}/chat`, {
      method: "POST",
      body: JSON.stringify({ message }),
    })
  }

  // Marketplace endpoints
  async getMarketplaceItems(category?: string, search?: string) {
    const params = new URLSearchParams()
    if (category) params.append("category", category)
    if (search) params.append("search", search)
    const query = params.toString()
    return this.request(`/marketplace${query ? `?${query}` : ""}`)
  }

  async purchaseItem(itemId: string) {
    return this.request(`/marketplace/${itemId}/purchase`, {
      method: "POST",
    })
  }

  async createCheckoutSession(data: {
    itemId: string
    itemTitle: string
    price: number
    itemType?: string
  }) {
    return this.request<{
      sessionId: string
      url: string
    }>("/checkout", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // Notification endpoints
  async getNotifications() {
    return this.request<
      Array<{
        id: string
        user_id: string
        type: "like" | "comment" | "share" | "follow" | "purchase" | "system"
        title: string
        message: string
        link?: string
        read: boolean
        created_at: string
      }>
    >("/notifications")
  }

  // Purchase endpoints
  async getPurchases() {
    return this.request<
      Array<{
        id: string
        user_id: string
        item_id: string
        stripe_session_id: string | null
        amount: number
        status: "pending" | "completed" | "failed" | "refunded"
        purchased_at: string
        created_at: string
        updated_at: string
      }>
    >("/purchases")
  }

  async markNotificationRead(id: string) {
    return this.request(`/notifications/${id}/read`, {
      method: "PUT",
    })
  }

  // Search endpoints
  async search(query: string, options?: SearchFilters): Promise<ApiResponse<SearchResponse>> {
    const params = new URLSearchParams({
      q: query,
      ...(options?.type && options.type !== "all" ? { type: options.type } : {}),
      ...(options?.limit ? { limit: options.limit.toString() } : {}),
    })
    return this.request(`/search?${params.toString()}`)
  }

  // Collections endpoints
  async getCollections(collectionId?: string) {
    const url = collectionId ? `/collections?id=${collectionId}` : "/collections"
    return this.request<
      Array<{
        id: string
        user_id: string
        name: string
        description?: string
        color?: string
        icon?: string
        created_at: string
        updated_at: string
        item_count?: number
      }>
    >(url)
  }

  async createCollection(data: { name: string; description?: string; color?: string; icon?: string }) {
    return this.request<{
      id: string
      user_id: string
      name: string
      description?: string
      color?: string
      icon?: string
      created_at: string
      updated_at: string
      item_count?: number
    }>("/collections", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateCollection(
    collectionId: string,
    data: { name?: string; description?: string; color?: string; icon?: string },
  ) {
    return this.request<{
      id: string
      user_id: string
      name: string
      description?: string
      color?: string
      icon?: string
      created_at: string
      updated_at: string
    }>(`/collections?id=${collectionId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  async deleteCollection(collectionId: string) {
    return this.request(`/collections?id=${collectionId}`, {
      method: "DELETE",
    })
  }

  async getCollectionItems(collectionId: string) {
    return this.request<FeedItem[]>(`/collections/items?collectionId=${collectionId}`)
  }

  async addItemToCollection(collectionId: string, itemId: string) {
    return this.request("/collections/items", {
      method: "POST",
      body: JSON.stringify({ collectionId, itemId }),
    })
  }

  async removeItemFromCollection(collectionId: string, itemId: string) {
    return this.request(`/collections/items?collectionId=${collectionId}&itemId=${itemId}`, {
      method: "DELETE",
    })
  }

  // Tags endpoints
  async getTags(tagId?: string) {
    const url = tagId ? `/tags?id=${tagId}` : "/tags"
    return this.request<
      Array<{
        id: string
        user_id: string
        name: string
        color?: string
        created_at: string
        item_count?: number
      }>
    >(url)
  }

  async createTag(data: { name: string; color?: string }) {
    return this.request<{
      id: string
      user_id: string
      name: string
      color?: string
      created_at: string
    }>("/tags", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateTag(tagId: string, data: { name?: string; color?: string }) {
    return this.request<{
      id: string
      user_id: string
      name: string
      color?: string
      created_at: string
    }>(`/tags?id=${tagId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  async deleteTag(tagId: string) {
    return this.request(`/tags?id=${tagId}`, {
      method: "DELETE",
    })
  }

  async addTagToItem(itemId: string, tagId: string) {
    return this.request("/tags/items", {
      method: "POST",
      body: JSON.stringify({ itemId, tagId }),
    })
  }

  async removeTagFromItem(itemId: string, tagId: string) {
    return this.request(`/tags/items?itemId=${itemId}&tagId=${tagId}`, {
      method: "DELETE",
    })
  }

  // Archive endpoints
  async getArchivedItems() {
    return this.request<FeedItem[]>("/archive")
  }

  async archiveItem(itemId: string) {
    return this.request("/archive", {
      method: "POST",
      body: JSON.stringify({ itemId }),
    })
  }

  async unarchiveItem(itemId: string) {
    return this.request(`/archive?itemId=${itemId}`, {
      method: "DELETE",
    })
  }

  // Follow endpoints
  async getFollows(userId?: string, type: "followers" | "following" = "followers") {
    const params = new URLSearchParams()
    if (userId) params.append("userId", userId)
    params.append("type", type)
    return this.request<
      Array<{
        id: string
        follower_id: string
        following_id: string
        created_at: string
        follower?: {
          id: string
          name: string
          email: string
          avatar?: string
        }
        following?: {
          id: string
          name: string
          email: string
          avatar?: string
        }
      }>
    >(`/follows?${params.toString()}`)
  }

  async followUser(userId: string) {
    return this.request<{
      id: string
      follower_id: string
      following_id: string
      created_at: string
    }>("/follows", {
      method: "POST",
      body: JSON.stringify({ userId }),
    })
  }

  async unfollowUser(userId: string) {
    return this.request(`/follows?userId=${userId}`, {
      method: "DELETE",
    })
  }

  // Comments endpoints
  async getComments(feedItemId: string): Promise<
    ApiResponse<{
      comments: Comment[]
      total: number
    }>
  > {
    return this.request(`/comments?feedItemId=${feedItemId}`)
  }

  async createComment(data: CreateCommentRequest): Promise<ApiResponse<Comment>> {
    return this.request("/comments", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateComment(commentId: string, content: string) {
    return this.request<{
      id: string
      feed_item_id: string
      user_id: string
      parent_id?: string
      content: string
      created_at: string
      updated_at: string
      author?: {
        id: string
        name: string
        email: string
        avatar?: string
      }
    }>(`/comments?id=${commentId}`, {
      method: "PATCH",
      body: JSON.stringify({ content }),
    })
  }

  async deleteComment(commentId: string) {
    return this.request(`/comments?id=${commentId}`, {
      method: "DELETE",
    })
  }

  // Upload endpoints
  async uploadFiles(files: File[]) {
    // Convert files to base64 for API
    const filePromises = files.map(async (file) => {
      const arrayBuffer = await file.arrayBuffer()
      const base64 = Buffer.from(arrayBuffer).toString("base64")
      return {
        name: file.name,
        type: file.type,
        data: base64,
      }
    })

    const fileData = await Promise.all(filePromises)

    return this.request<{
      urls: string[]
      fileNames: string[]
    }>("/upload", {
      method: "POST",
      body: JSON.stringify({ files: fileData }),
    })
  }

  // ============================================
  // ORGANIZATIONS & TEAMS
  // ============================================
  async getOrganizations(id?: string, slug?: string) {
    const params = new URLSearchParams()
    if (id) params.append("id", id)
    if (slug) params.append("slug", slug)
    return this.request<Array<any>>(`/organizations?${params}`)
  }

  async createOrganization(data: {
    name: string
    slug: string
    description?: string
    logo_url?: string
    plan?: string
  }) {
    return this.request<any>("/organizations", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateOrganization(
    id: string,
    data: Partial<{ name: string; slug: string; description: string; logo_url: string; plan: string }>,
  ) {
    return this.request<any>("/organizations", {
      method: "PUT",
      body: JSON.stringify({ id, ...data }),
    })
  }

  async deleteOrganization(id: string) {
    return this.request<{ success: boolean }>(`/organizations?id=${id}`, {
      method: "DELETE",
    })
  }

  // Organization Members
  async getOrganizationMembers(organizationId: string) {
    return this.request<Array<any>>(`/organizations/members?organization_id=${organizationId}`)
  }

  async inviteMember(organizationId: string, data: { user_id?: string; email?: string; role?: string }) {
    return this.request<any>("/organizations/members", {
      method: "POST",
      body: JSON.stringify({ organization_id: organizationId, ...data }),
    })
  }

  async updateMemberRole(memberId: string, role: string) {
    return this.request<any>("/organizations/members", {
      method: "PUT",
      body: JSON.stringify({ id: memberId, role }),
    })
  }

  async removeMember(memberId: string) {
    return this.request<{ success: boolean }>(`/organizations/members?id=${memberId}`, {
      method: "DELETE",
    })
  }

  // Workspaces
  async getWorkspaces(organizationId: string, id?: string) {
    const params = new URLSearchParams({ organization_id: organizationId })
    if (id) params.append("id", id)
    return this.request<Array<any>>(`/workspaces?${params}`)
  }

  async createWorkspace(data: { organization_id: string; name: string; description?: string }) {
    return this.request<any>("/workspaces", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateWorkspace(id: string, data: Partial<{ name: string; description: string }>) {
    return this.request<any>("/workspaces", {
      method: "PUT",
      body: JSON.stringify({ id, ...data }),
    })
  }

  async deleteWorkspace(id: string) {
    return this.request<{ success: boolean }>(`/workspaces?id=${id}`, {
      method: "DELETE",
    })
  }

  // ============================================
  // ADMIN
  // ============================================
  async getAdminUsers(id?: string, search?: string, page?: number, limit?: number) {
    const params = new URLSearchParams()
    if (id) params.append("id", id)
    if (search) params.append("search", search)
    if (page) params.append("page", page.toString())
    if (limit) params.append("limit", limit.toString())
    return this.request<any>(`/admin/users?${params}`)
  }

  async updateAdminUser(id: string, data: Record<string, any>) {
    return this.request<any>("/admin/users", {
      method: "PUT",
      body: JSON.stringify({ id, ...data }),
    })
  }

  async deleteAdminUser(id: string) {
    return this.request<{ success: boolean }>(`/admin/users?id=${id}`, {
      method: "DELETE",
    })
  }

  async getModerationRecords(status?: string, resourceType?: string, page?: number, limit?: number) {
    const params = new URLSearchParams()
    if (status) params.append("status", status)
    if (resourceType) params.append("resource_type", resourceType)
    if (page) params.append("page", page.toString())
    if (limit) params.append("limit", limit.toString())
    return this.request<any>(`/admin/moderation?${params}`)
  }

  async moderateContent(data: {
    resource_type: string
    resource_id: string
    status: string
    reason?: string
    moderation_notes?: string
  }) {
    return this.request<any>("/admin/moderation", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateModeration(id: string, data: { status?: string; reason?: string; moderation_notes?: string }) {
    return this.request<any>("/admin/moderation", {
      method: "PUT",
      body: JSON.stringify({ id, ...data }),
    })
  }

  // ============================================
  // GDPR
  // ============================================
  async exportUserData() {
    return this.request<any>("/gdpr/export")
  }

  async deleteAccount(confirm: string) {
    return this.request<{ success: boolean; message?: string }>("/gdpr/delete", {
      method: "POST",
      body: JSON.stringify({ confirm }),
    })
  }

  // ============================================
  // ANALYTICS EXPORT
  // ============================================
  async exportAnalytics(format: "json" | "csv" = "json", timeRange = "30d") {
    return this.request<any>(`/analytics/export?format=${format}&timeRange=${timeRange}`)
  }

  // Expose request method for custom endpoints (helper)
  async customRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, options)
  }
}

export const apiService = new ApiService()
export default apiService
