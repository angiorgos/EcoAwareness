import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#1a6db5',
        },
        background: {
            default: '#e8eff7',
            paper: '#f5f9ff',
        },
        text: {
            primary: '#0f1b2d',
            secondary: '#3d5166',
        },
    },
});

export default theme;