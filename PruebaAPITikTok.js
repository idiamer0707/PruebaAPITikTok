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
    const csrfState = generateCSRFToken(); 
    const authUrl = `https://www.tiktok.com/v2/auth/authorize?client_key=${clientKey}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=user.info.basic,user.info.stats,video.list&state=${csrfState}`;
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
            console.log('Scope del token:', data.scope);
            fetchUserInfo(data.access_token); 
            fetchUserVideos(data.access_token); 
        } else {
            console.error('Error al obtener el token:', data);
        }
    } catch (error) {
        console.error('Error durante el intercambio de código por token:', error);
    }
}

async function fetchUserInfo(accessToken) {
    try {
        const fields = 'open_id,union_id,avatar_url,follower_count'; 
        console.log('Intentando obtener información del usuario con el token:', accessToken);

        const response = await fetch(`https://open.tiktokapis.com/v2/user/info/?fields=${fields}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();
        if (data && data.data) {
            const followers = data.data.user.follower_count; 
            const image = data.data.user.avatar_url;
            document.getElementById('image').src = image;
            document.getElementById('seguidores').innerText = `Número de seguidores: ${followers ?? 'No disponible'}`;
        } else {
            console.error('No se encontraron datos válidos en la respuesta.');
        }
    } catch (error) {
        console.error('Error al obtener la información del usuario:', error);
    }
}

async function fetchUserVideos(accessToken) {
    try {
        console.log('Obteniendo videos del usuario autenticado...');
        const response = await fetch(`https://open.tiktokapis.com/v2/video/list`, {
            method: 'GET',
            mode: 'no-cors',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        const text = await response.text(); // Obtener texto bruto de la respuesta
        console.log('Respuesta completa:', text);
        
        const data = await response.json();
        if (data && data.data && data.data.videos) {
            let totalLikes = 0;
            let totalComments = 0;
            let totalViews = 0;

            data.data.videos.forEach(video => {
                totalLikes += parseInt(video.like_count || 0);
                totalComments += parseInt(video.comment_count || 0);
                totalViews += parseInt(video.play_count || 0);
            });

            document.getElementById('likes').innerText = `Número total de likes: ${totalLikes}`;
            document.getElementById('comments').innerText = `Número total de comentarios: ${totalComments}`;
            document.getElementById('views').innerText = `Número total de visualizaciones: ${totalViews}`;
        } else {
            console.error('No se encontraron videos válidos en la respuesta.');
        }
    } catch (error) {
        console.error('Error al obtener los videos del usuario:', error);
    }
}

document.getElementById('loguin').addEventListener('click', () => {
    localStorage.removeItem('csrfState'); 
    localStorage.removeItem('accessToken'); 
    loginWithTikTok();
});

if (window.location.search.includes('code')) {
    handleCallback();
}
