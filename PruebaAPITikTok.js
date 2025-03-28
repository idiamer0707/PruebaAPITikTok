
const clientKey = 'sbawcifd42tz2khdzw';
const clientSecret = 'dVjeHjhCGwv7P92ONgarTah0vkY8ztGC'; 
const redirectUri = 'https://idiamer0707.github.io/PruebaAPITikTok/'; 


function generateCSRFToken() {
    let array = new Uint8Array(30);
    const csrfState = Array.from(window.crypto.getRandomValues(array), byte => byte.toString(16)).join('');
    localStorage.setItem('csrfState', csrfState); // Guardar el token en almacenamiento local
    return csrfState;
}


function loginWithTikTok() {
    const csrfState = generateCSRFToken(); // Generar token
    const authUrl = `https://www.tiktok.com/v2/auth/authorize?client_key=${clientKey}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=user.info.basic&state=${csrfState}`;
    window.location.href = authUrl; // Redirigir al usuario
}


function handleCallback() {
    const params = new URLSearchParams(window.location.search);
    const returnedState = params.get('state');
    const originalState = localStorage.getItem('csrfState');
    const authorizationCode = params.get('code');

    
    if (!returnedState || returnedState !== originalState) {
        console.error('Error: el token de estado no coincide. Posible ataque CSRF.');
        return;
    }

    console.log('Token de estado válido. Continuar con la autenticación.');

    
    if (authorizationCode) {
        fetchAccessToken(authorizationCode);
    } else {
        console.error('No se recibió un código de autorización.');
    }
}


async function fetchAccessToken(authCode) {
    try {
        const response = await fetch('https://open.tiktokapis.com/v2/oauth/token/', { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_key: clientKey,
                client_secret: clientSecret,
                code: authCode,
                grant_type: 'authorization_code',
                redirect_uri: redirectUri,
            }).toString(), 
        });

        const data = await response.json();
        if (data.access_token) {
            console.log('Access Token:', data.access_token);
            fetchUserInfo(data.access_token); 
        } else {
            console.error('Error al obtener el token:', data);
        }
    } catch (error) {
        console.error('Error durante el intercambio de código por token:', error);
    }
}

async function fetchUserInfo(accessToken) {
  try {
      const response = await fetch('https://open.tiktokapis.com/v2/user/info/', { 
          method: 'GET',
          headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
          },
      });

      if (!response.ok) {
          console.error('Error en la solicitud:', response.status, response.statusText);
          return;
      }

      const data = await response.json();
      if (data && data.data) { 
          console.log('Información del usuario:', data.data);
          const followers = data.data.follower_count;
          document.getElementById('seguidores').innerText = `Número de seguidores: ${followers}`;
      } else {
          console.error('Error al obtener la información del usuario:', data);
      }
  } catch (error) {
      console.error('Error al obtener la información del usuario:', error);
  }
}


document.getElementById('loguin').addEventListener('click', () => {
    loginWithTikTok();
});


if (window.location.search.includes('code')) {
    handleCallback();
}
