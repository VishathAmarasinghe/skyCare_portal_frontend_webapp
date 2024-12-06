import { createContext, useState, useMemo } from "react";
import { Provider } from "react-redux";

// MUI imports
import { ThemeProvider, createTheme } from "@mui/material/styles";

// APP imports
import { store } from "./slices/store";
import { ThemeMode } from "./utils/types";
import { APP_NAME, AppConfig } from "./config/config";
import AppHandler from "./app/AppHandler";
import { themeSettings } from "./theme";
import "./App.css";

// Other imports
import { SnackbarProvider } from "notistack";
import { APIService } from "@utils/apiService";
import ConfirmationDialogContextProvider from "@context/DialogContext";
import { LoadScript } from "@react-google-maps/api";

export const ColorModeContext = createContext({ toggleColorMode: () => {} });

function App() {
  document.title = APP_NAME;
  const processLocalThemeMode = (): ThemeMode => {
    var localMode: ThemeMode | null = localStorage.getItem(
      "internal-app-theme"
    ) as ThemeMode;

    if (localMode) {
      return localMode;
    } else {
      localStorage.setItem("internal-app-theme", ThemeMode.Dark);
      return ThemeMode.Dark;
    }
  };

  const [mode, setMode] = useState<ThemeMode>(processLocalThemeMode());

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        localStorage.setItem(
          "internal-app-theme",
          mode === ThemeMode.Light ? ThemeMode.Dark : ThemeMode.Light
        );
        setMode((prevMode) =>
          prevMode === ThemeMode.Light ? ThemeMode.Dark : ThemeMode.Light
        );
      },
    }),
    [mode]
  );

  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <SnackbarProvider maxSnack={3} preventDuplicate>
        <LoadScript
          googleMapsApiKey="AIzaSyB_cvNijyVjUPr189twbkzvxKNPId0rPNk"
          libraries={["places"]}
          onError={(e) => console.error("Error loading Google API", e)}
          onLoad={() => console.log("Google API loaded successfully")}
        >
          <ThemeProvider theme={theme}>
            <Provider store={store}>
              <ConfirmationDialogContextProvider>
                <AppHandler />
              </ConfirmationDialogContextProvider>
            </Provider>
          </ThemeProvider>
        </LoadScript>
      </SnackbarProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
