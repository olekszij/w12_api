# API REST

API REST Test:

<code>get /api/v1/users</code> - obtener datos de usuarios del fichero <em>users.json</em>. Si no existe, obtenerles <a href="https://jsonplaceholder.typicode.com/users" target="_blank">del URL</a>, rellenar el fichero <em>users.json</a> con los datos recibidos y devolverles.

<code>post /api/v1/users</code> - añadir un usuario nuevo al fichero <em>users.json</em> con <em>id</em> que equivale al <em>id</em> del último usuario aumentado en 1. Devolver estado <em>{ status: 'SUCCESS', id: id }</em>.

<code>patch /api/v1/users/:userId</code> - renovar el usuario identificado por su <em>id</em>. Devolver estado <em>{ status: 'SUCCESS', id: userId }</em>

<code>delete /api/v1/users/:userId</code> - eliminar el usuario identificado por su <em>id</em>. Devolver estado <em>{ status: 'SUCCESS', id: userId }</em>

<code>delete /api/v1/users</code> - eliminar el fichero <em>users.json</em>. Devolver estado <em>{ status: 'SUCCESS', id: userId }</em>

# Online Demo

<a href="https://w12-api.herokuapp.com/" target="_blank">https://w12-api.herokuapp.com/</a>