window.onload = function () {
  TikTok.init({
      client_key: 'sbawcifd42tz2khdzw',
      redirect_uri: 'https://idiamer0707.github.io/PruebaAPITikTok/'
  });
};

document.getElementById('loguin').addEventListener('click', async () => {
  TikTok.login()
  .then(response => {
      console.log('Usuario autenticado:', response);
      
  })
  .catch(error => {
      console.error('Error en el login:', error);
  });
});
