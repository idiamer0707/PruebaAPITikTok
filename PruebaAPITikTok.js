const clientKey = 'sbawcifd42tz2khdzw'; 
const redirectUri = 'https://idiamer0707.github.io/PruebaAPITikTok/'; 

function loginWithTikTok() {
    const authUrl = `https://www.tiktok.com/auth/authorize?client_key=${clientKey}&redirect_uri=${redirectUri}&response_type=code&scope=user.info.basic`;
    window.location.href = authUrl;
}

async function fetchAccessToken(authCode) {
    try {
        const response = await fetch('https://www.tiktok.com/auth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                client_key: clientKey,
                client_secret: 'dVjeHjhCGwv7P92ONgarTah0vkY8ztGC', 
                code: authCode,
                grant_type: 'authorization_code',
                redirect_uri: redirectUri,
            }),
        });

        const data = await response.json();
        console.log('Access Token:', data.access_token);
        // Maneja el token aquí (como guardarlo en sesión o usarlo para la API)
    } catch (error) {
        console.error('Error obteniendo el token:', error);
    }
}
