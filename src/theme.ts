// MUI imports
import { PaletteMode, Theme, alpha } from "@mui/material";

// color design tokens export
export const tokens = (mode: PaletteMode) => ({
  ...(mode === "dark"
    ? {
        grey: {
          100: "#ffffff",
          200: "#e0e0e0",
          300: "#666666",
          400: "#3d3d3d",
          500: "#141414",
          600: "#000000",
        },
        primary: {
          100: "#055476",
        },
      }
    : {
        grey: {
          100: "#000000",
          200: "#141414",
          300: "#666666",
          400: "#a3a3a3",
          500: "#393E46",
          600: "#E7F6FC",
        },
        primary: {
          100: "#055476",
        },
      }),
});

// mui theme settings
export const themeSettings = (mode: PaletteMode) => {
  const colors = tokens(mode);
  return {
    palette: {
      mode: mode,
      ...(mode === "dark"
        ? {
            primary: {
              main: colors.primary[100],
            },
            secondary: {
              dark: colors.grey[300],
              main: colors.grey[200],
              light: colors.grey[200],
              contrastText: colors.grey[600],
            },
            background: {
              default: colors.grey[500],
            },
          }
        : {
            // palette values for light mode
            primary: {
              main: colors.primary[100],
              contrastText: colors.grey[600],
            },
            secondary: {
              light: colors.grey[400],
              dark: colors.grey[300],
              main: colors.grey[200],
            },
            background: {
              default: colors.grey[600],
            },
            header: {
              header: "#F1F7FF",
            },
          }),
    },
    typography: {
      fontSize: 11, // Base font size
      fontFamily: ["Poppins", "sans-serif"].join(","),
      default: {
        // Default styles for typography without a specified variant
        fontSize: "0.8rem",
        [`@media (max-width:1400px)`]: { fontSize: "0.95rem" },
        [`@media (max-width:1200px)`]: { fontSize: "0.7rem" },
        [`@media (max-width:960px)`]: { fontSize: "0.85rem" },
        [`@media (max-width:768px)`]: { fontSize: "0.8rem" },
      },
      h1: {
        fontSize: "2.5rem",
        fontWeight: 700,
        [`@media (max-width:1400px)`]: { fontSize: "2.2rem" },
        [`@media (max-width:1200px)`]: { fontSize: "2rem" },
        [`@media (max-width:960px)`]: { fontSize: "1.8rem" },
        [`@media (max-width:768px)`]: { fontSize: "1.6rem" },
        [`@media (max-width:600px)`]: { fontSize: "1.4rem" },
      },
      h2: {
        fontSize: "2rem",
        fontWeight: 600,
        [`@media (max-width:1400px)`]: { fontSize: "1.8rem" },
        [`@media (max-width:1200px)`]: { fontSize: "1.6rem" },
        [`@media (max-width:960px)`]: { fontSize: "1.5rem" },
        [`@media (max-width:768px)`]: { fontSize: "1.4rem" },
        [`@media (max-width:600px)`]: { fontSize: "1.2rem" },
      },
      h3: {
        fontSize: "1.8rem",
        fontWeight: 500,
        [`@media (max-width:1400px)`]: { fontSize: "1.6rem" },
        [`@media (max-width:1200px)`]: { fontSize: "1.5rem" },
        [`@media (max-width:960px)`]: { fontSize: "1.4rem" },
        [`@media (max-width:768px)`]: { fontSize: "1.3rem" },
        [`@media (max-width:600px)`]: { fontSize: "1.2rem" },
      },
      h4: {
        fontSize: "1.6rem",
        fontWeight: 500,
        [`@media (max-width:1400px)`]: { fontSize: "1.5rem" },
        [`@media (max-width:1200px)`]: { fontSize: "1.4rem" },
        [`@media (max-width:960px)`]: { fontSize: "1.3rem" },
        [`@media (max-width:768px)`]: { fontSize: "1.2rem" },
        [`@media (max-width:600px)`]: { fontSize: "1.1rem" },
      },
      h5: {
        fontSize: "1.0rem",
        fontWeight: 400,
        [`@media (max-width:1400px)`]: { fontSize: "1.3rem" },
        [`@media (max-width:1200px)`]: { fontSize: "1.2rem" },
        [`@media (max-width:960px)`]: { fontSize: "1.1rem" },
        [`@media (max-width:768px)`]: { fontSize: "1rem" },
        [`@media (max-width:600px)`]: { fontSize: "0.9rem" },
      },
      h6: {
        fontSize: "0.9rem",
        fontWeight: 400,
        [`@media (max-width:1400px)`]: { fontSize: "1.1rem" },
        [`@media (max-width:1200px)`]: { fontSize: "1rem" },
        [`@media (max-width:960px)`]: { fontSize: "0.7rem" },
        [`@media (max-width:768px)`]: { fontSize: "0.7rem" },
        [`@media (max-width:600px)`]: { fontSize: "0.7rem" },
      },
      body1: {
        fontSize: "0.80rem",
        [`@media (max-width:1400px)`]: { fontSize: "0.95rem" },
        [`@media (max-width:1200px)`]: { fontSize: "0.90rem" },
        [`@media (max-width:960px)`]: { fontSize: "0.85rem" },
        [`@media (max-width:768px)`]: { fontSize: "0.8rem" },
        [`@media (max-width:600px)`]: { fontSize: "0.75rem" },
      },
      body2: {
        fontSize: "0.775rem",
        [`@media (max-width:1400px)`]: { fontSize: "0.85rem" },
        [`@media (max-width:1200px)`]: { fontSize: "0.8rem" },
        [`@media (max-width:960px)`]: { fontSize: "0.75rem" },
        [`@media (max-width:768px)`]: { fontSize: "0.7rem" },
      },
      caption: {
        fontSize: "0.75rem",
        [`@media (max-width:1400px)`]: { fontSize: "0.7rem" },
        [`@media (max-width:1200px)`]: { fontSize: "0.65rem" },
        [`@media (max-width:960px)`]: { fontSize: "0.6rem" },
      },
      button: {
        fontSize: "0.875rem",
        [`@media (max-width:1400px)`]: { fontSize: "0.85rem" },
        [`@media (max-width:1200px)`]: { fontSize: "0.8rem" },
        [`@media (max-width:960px)`]: { fontSize: "0.75rem" },
      },
    },

    components: {
      MuiButton: {
        styleOverrides: {},
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiInputBase-root": {
              size: "small",
            },
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          root: {
            backdropFilter: "blur(5px)",
          },
          paper: {
            width: "90vw",
            borderRadius: 4,
            maxHeight: "90vh",
            "& .MuiDialogTitle-root": {
              fontWeight: "bold",
            },
          },
        },
      },
      MuiDataGrid: {
        styleOverrides: {
          root: {
            fontSize: 12,
            pb: 0,
            height: `calc(100% - 40px)`,
            width: "100%",
            border: "none",
            "& .MuiDataGrid-cell:focus": {
              outline: "none",
            },
            "& .MuiDataGrid-cell:focus-within": {
              outline: "none",
              backgroundColor: (theme: Theme) =>
                alpha(colors.grey[100], theme.palette.action.activatedOpacity),
            },
            "& .MuiDataGrid-columnHeader:focus": {
              outline: "none",
            },
            "& .MuiDataGrid-columnHeader-within": {
              outline: "none",
            },
            "& .MuiDataGrid-columnHeader:focus-within": {
              outline: "none",
            },
            ".MuiDataGrid-row:focus": {
              borderRadius: 0,
            },
            ".MuiDataGrid-row:focus-within": {
              borderRadius: 0,
            },
            "& .MuiDataGrid-columnHeaderCheckbox .MuiDataGrid-columnHeaderTitleContainer":
              {
                display: "none",
              },
            ".MuiDataGrid-columnHeaderTitle": {
              fontSize: 13,
              fontWeight: "bold",
            },
          },
          columnHeader: {
            backgroundColor: alpha("#769FCD", 0.2),
            borderRadius: 0,
            mb: 2,
          },
        },
      },
    },
  };
};
