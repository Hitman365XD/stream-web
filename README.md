# Web personalizada para transmisión de vídeo

Aplicación web alterna para transmisiones en vivo ligadas a Twitch, con información del canal emisor, chat incorporado e interfaz similar.

## Requisitos

* Instalar Node, el cual ya viene con React.

## Funcionamiento

* **Lectura de API twitch para credenciales**

    Aquí es ejecutar un [servicio de vídeo](https://github.com/Hitman365XD/stream-server), que envía tanto el archivo multimedia y la información del canal. Deben ser colocados en un .env, que tendrá la misma estructura de `.env.example` (VITE_STREAM_URL recibe el `/hls/stream.m3u8` y VITE_RESPONSE_URL el `/stream-data`).

    Para el dominio (VITE_TWITCH_PARENT), pueden usar su `localhost` o `streaming.local` con ip `127.0.0.1` (puede ser agregado en el archivo hosts de la ruta `C:\Windows\System32\drivers\etc\`).

* **Funcionamiento en local**

    Asegurarse de estar en la dirección del poryecto y colocar:
    ```
    npm run dev
    ```
    El puerto que usa por default es el `5173`.    

Acceder al enlace localhost que proporcione la consola.

## Despliegue público

Puede hacer uso de Ngrok para poner la web pública a modo de desarrollo (se debe modificar `vite.config.js`, agregar en `allowedHosts` el dominio que se otorgue). Una vez hehco lo anterior, puede ejecutar:
```
npm run dev --host
```
De ahí, en otra terminal ejecutar:
```
ngrok http 5173
```

Acceder al enlace que se muestre en la terminal y otros usuarios podrán ver la web.