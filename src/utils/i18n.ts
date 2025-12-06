// Internationalization utilities

export type Locale = 'en' | 'es' | 'fr' | 'de' | 'ja' | 'zh';

export interface Translations {
  [key: string]: string | Translations;
}

const translations: Record<Locale, Translations> = {
  en: {
    common: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      create: 'Create',
      search: 'Search',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
    },
    nav: {
      home: 'Home',
      create: 'Create',
      marketplace: 'Marketplace',
      profile: 'Profile',
      settings: 'Settings',
    },
    feed: {
      title: 'Feed',
      noPosts: 'No posts yet',
      createFirst: 'Create your first post',
    },
    auth: {
      signIn: 'Sign In',
      signUp: 'Sign Up',
      signOut: 'Sign Out',
    },
  },
  es: {
    common: {
      save: 'Guardar',
      cancel: 'Cancelar',
      delete: 'Eliminar',
      edit: 'Editar',
      create: 'Crear',
      search: 'Buscar',
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
      confirm: 'Confirmar',
      close: 'Cerrar',
      back: 'Atrás',
      next: 'Siguiente',
      previous: 'Anterior',
      submit: 'Enviar',
      upload: 'Subir',
      download: 'Descargar',
      share: 'Compartir',
      like: 'Me gusta',
      comment: 'Comentar',
      follow: 'Seguir',
      unfollow: 'Dejar de seguir',
    },
    nav: {
      home: 'Inicio',
      create: 'Crear',
      marketplace: 'Mercado',
      profile: 'Perfil',
      settings: 'Configuración',
      search: 'Buscar',
      notifications: 'Notificaciones',
      analytics: 'Analíticas',
      collections: 'Colecciones',
      organizations: 'Organizaciones',
      admin: 'Administración',
    },
    feed: {
      title: 'Feed',
      noPosts: 'Aún no hay publicaciones',
      createFirst: 'Crea tu primera publicación',
      following: 'Siguiendo',
      all: 'Todo',
      marketplace: 'Mercado',
      universe: 'Universo',
      views: 'Vistas',
      likes: 'Me gusta',
      comments: 'Comentarios',
      shares: 'Compartidos',
    },
    auth: {
      signIn: 'Iniciar Sesión',
      signUp: 'Registrarse',
      signOut: 'Cerrar Sesión',
      email: 'Correo electrónico',
      password: 'Contraseña',
      forgotPassword: '¿Olvidaste tu contraseña?',
      rememberMe: 'Recordarme',
    },
    content: {
      create: 'Crear Contenido',
      title: 'Título',
      description: 'Descripción',
      type: 'Tipo',
      publish: 'Publicar',
      schedule: 'Programar',
      draft: 'Borrador',
      published: 'Publicado',
      scheduled: 'Programado',
    },
    social: {
      followers: 'Seguidores',
      following: 'Siguiendo',
      posts: 'Publicaciones',
      follow: 'Seguir',
      unfollow: 'Dejar de seguir',
      message: 'Mensaje',
      mention: 'Mencionar',
    },
    notifications: {
      title: 'Notificaciones',
      all: 'Todas',
      unread: 'No leídas',
      markAllRead: 'Marcar todas como leídas',
      noNotifications: 'No hay notificaciones',
    },
    analytics: {
      title: 'Analíticas',
      posts: 'Publicaciones',
      views: 'Vistas',
      likes: 'Me gusta',
      comments: 'Comentarios',
      shares: 'Compartidos',
      engagement: 'Compromiso',
      export: 'Exportar',
      timeRange: 'Rango de tiempo',
    },
    errors: {
      generic: 'Algo salió mal',
      network: 'Error de red',
      unauthorized: 'No autorizado',
      notFound: 'No encontrado',
      serverError: 'Error del servidor',
    },
    marketplace: {
      title: 'Mercado',
      browse: 'Explorar',
      purchase: 'Comprar',
      price: 'Precio',
      description: 'Descripción',
      seller: 'Vendedor',
      noItems: 'No hay artículos disponibles',
      purchaseSuccess: 'Compra exitosa',
      purchaseFailed: 'Error en la compra',
    },
    collections: {
      title: 'Colecciones',
      create: 'Crear Colección',
      edit: 'Editar Colección',
      delete: 'Eliminar Colección',
      name: 'Nombre',
      description: 'Descripción',
      items: 'Artículos',
      noCollections: 'No tienes colecciones',
      addItem: 'Agregar Artículo',
      removeItem: 'Eliminar Artículo',
    },
    organizations: {
      title: 'Organizaciones',
      create: 'Crear Organización',
      edit: 'Editar Organización',
      delete: 'Eliminar Organización',
      name: 'Nombre',
      slug: 'Identificador',
      description: 'Descripción',
      members: 'Miembros',
      workspaces: 'Espacios de Trabajo',
      invite: 'Invitar Miembro',
      role: 'Rol',
      owner: 'Propietario',
      admin: 'Administrador',
      editor: 'Editor',
      member: 'Miembro',
      viewer: 'Visualizador',
    },
    admin: {
      title: 'Panel de Administración',
      users: 'Usuarios',
      moderation: 'Moderación',
      analytics: 'Analíticas',
      settings: 'Configuración',
      manageUsers: 'Gestionar Usuarios',
      contentModeration: 'Moderación de Contenido',
      systemAnalytics: 'Analíticas del Sistema',
      featureFlags: 'Banderas de Funcionalidad',
    },
  },
  fr: {
    common: {
      save: 'Enregistrer',
      cancel: 'Annuler',
      delete: 'Supprimer',
      edit: 'Modifier',
      create: 'Créer',
      search: 'Rechercher',
      loading: 'Chargement...',
      error: 'Erreur',
      success: 'Succès',
    },
    nav: {
      home: 'Accueil',
      create: 'Créer',
      marketplace: 'Marché',
      profile: 'Profil',
      settings: 'Paramètres',
    },
    feed: {
      title: 'Fil',
      noPosts: 'Aucune publication pour le moment',
      createFirst: 'Créez votre première publication',
    },
    auth: {
      signIn: 'Se connecter',
      signUp: "S'inscrire",
      signOut: 'Se déconnecter',
    },
  },
  de: {
    common: {
      save: 'Speichern',
      cancel: 'Abbrechen',
      delete: 'Löschen',
      edit: 'Bearbeiten',
      create: 'Erstellen',
      search: 'Suchen',
      loading: 'Laden...',
      error: 'Fehler',
      success: 'Erfolg',
    },
    nav: {
      home: 'Startseite',
      create: 'Erstellen',
      marketplace: 'Marktplatz',
      profile: 'Profil',
      settings: 'Einstellungen',
    },
    feed: {
      title: 'Feed',
      noPosts: 'Noch keine Beiträge',
      createFirst: 'Erstellen Sie Ihren ersten Beitrag',
    },
    auth: {
      signIn: 'Anmelden',
      signUp: 'Registrieren',
      signOut: 'Abmelden',
    },
  },
  ja: {
    common: {
      save: '保存',
      cancel: 'キャンセル',
      delete: '削除',
      edit: '編集',
      create: '作成',
      search: '検索',
      loading: '読み込み中...',
      error: 'エラー',
      success: '成功',
    },
    nav: {
      home: 'ホーム',
      create: '作成',
      marketplace: 'マーケットプレイス',
      profile: 'プロフィール',
      settings: '設定',
    },
    feed: {
      title: 'フィード',
      noPosts: 'まだ投稿がありません',
      createFirst: '最初の投稿を作成',
    },
    auth: {
      signIn: 'サインイン',
      signUp: 'サインアップ',
      signOut: 'サインアウト',
    },
  },
  zh: {
    common: {
      save: '保存',
      cancel: '取消',
      delete: '删除',
      edit: '编辑',
      create: '创建',
      search: '搜索',
      loading: '加载中...',
      error: '错误',
      success: '成功',
    },
    nav: {
      home: '首页',
      create: '创建',
      marketplace: '市场',
      profile: '个人资料',
      settings: '设置',
    },
    feed: {
      title: '动态',
      noPosts: '还没有帖子',
      createFirst: '创建您的第一个帖子',
    },
    auth: {
      signIn: '登录',
      signUp: '注册',
      signOut: '退出',
    },
  },
};

let currentLocale: Locale = 'en';

export function setLocale(locale: Locale) {
  currentLocale = locale;
  localStorage.setItem('locale', locale);
  document.documentElement.lang = locale;
}

export function getLocale(): Locale {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('locale') as Locale;
    if (saved && translations[saved]) {
      return saved;
    }
  }
  return currentLocale;
}

export function t(key: string, params?: Record<string, string>): string {
  const locale = getLocale();
  const keys = key.split('.');
  let value: any = translations[locale];

  for (const k of keys) {
    value = value?.[k];
    if (!value) {
      // Fallback to English
      value = translations.en;
      for (const k2 of keys) {
        value = value?.[k2];
      }
      break;
    }
  }

  if (typeof value !== 'string') {
    return key; // Return key if translation not found
  }

  // Replace parameters
  if (params) {
    return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
      return params[paramKey] || match;
    });
  }

  return value;
}

export function formatDate(date: Date | string, locale?: Locale): string {
  const loc = locale || getLocale();
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(loc, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
}

export function formatNumber(num: number, locale?: Locale): string {
  const loc = locale || getLocale();
  return new Intl.NumberFormat(loc).format(num);
}

// Initialize locale on load
if (typeof window !== 'undefined') {
  const savedLocale = localStorage.getItem('locale') as Locale;
  if (savedLocale && translations[savedLocale]) {
    setLocale(savedLocale);
  }
}
