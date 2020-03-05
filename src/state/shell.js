import cacheKey from '../../.build/cacheKey';

/** Checks if the client is a bot */
const isBot = () =>
  typeof navigator !== 'undefined' &&
  typeof navigator.userAgent !== 'undefined' &&
  /bot|google|baidu|bing|msn|duckduckbot|teoma|slurp|yandex/i.test(navigator.userAgent);

// Default state
const initialState = {
  isDarkMode: undefined,
  hasGithubLinksEnabled: undefined,
  cacheKey,
  newCacheKey: cacheKey,
  isBot: isBot(),
  acceptsCookies: undefined,
};

// Actions
const TOGGLE_DARKMODE = 'TOGGLE_DARKMODE';
const TOGGLE_GITHUB_LINKS = 'TOGGLE_GITHUB_LINKS';
const ACCEPT_COOKIES = 'ACCEPT_COOKIES';
const DECLINE_COOKIES = 'DECLINE_COOKIES';

export const toggleDarkMode = isDarkMode => ({
  type: TOGGLE_DARKMODE,
  isDarkMode,
});

export const toggleGithubLinks = hasGithubLinksEnabled => ({
  type: TOGGLE_GITHUB_LINKS,
  hasGithubLinksEnabled,
});

export const decideCookies = cookieConsent => ({
  type: cookieConsent ? ACCEPT_COOKIES : DECLINE_COOKIES,
});

// Reducer
export default (state = initialState, action) => {
  switch (action.type) {
  case TOGGLE_DARKMODE:
    return {
      ...state,
      isDarkMode: action.isDarkMode,
    };
  case TOGGLE_GITHUB_LINKS:
    return {
      ...state,
      hasGithubLinksEnabled: action.hasGithubLinksEnabled,
    };
  case ACCEPT_COOKIES:
    return {
      ...state,
      acceptsCookies: true,
    };
  case DECLINE_COOKIES:
    return {
      ...state,
      acceptsCookies: false,
    };
  default:
    return state;
  }
};

// Persistence configuration
export const persistConfig = {
  key: 'shell',
  blacklist: ['newCacheKey', 'isBot'],
};
