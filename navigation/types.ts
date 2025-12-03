
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Journal: undefined;
  Review: undefined;
  Settings: undefined;
};

export type TabRoute = keyof MainTabParamList;

export interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}
