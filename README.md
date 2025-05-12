# ChatApp - Microservicios con Docker

Bienvenido a ChatApp, una aplicación distribuida basada en microservicios para autenticación de usuarios, gestión de salas y chat en tiempo real. Utiliza Node.js para los servicios backend, MongoDB para la persistencia, Nginx como balanceador de carga, y un frontend para la interfaz de usuario. Todo está orquestado con Docker Compose.
Tabla de Contenidos



##  Arquitectura
El sistema está compuesto por los siguientes componentes:

* **API Gateway:** Punto de entrada centralizado para todas las peticiones
Microservicios:

* **Auth API:** Gestión de autenticación y usuarios
* **Rooms API:** Gestión de salas/habitaciones
* **Chat API:** Gestión de mensajes y comunicaciones
* **Base de datos:** Clusters de MongoDB con replicación para cada servicio
* **Balanceador de carga:** Nginx como proxy inverso y balanceador


## 🛠️ Tecnologías

* **Backend:** Node.js, Express
  
* **Base de Datos:** MongoDB con ReplicaSet
* **Proxy/Balanceador:** Nginx
* **Contenedores:** Docker, Docker Compose
* **Protección DDoS:** Rate limiting, Circuit Breaker
* **WebSockets:** Socket.IO para comunicación en tiempo real

## 📋 Requisitos

* Docker y Docker Compose

* Node.js 16+ (para desarrollo local)
* Git
* Múltiples servidores/máquinas (recomendado para producción)

## 🛡️ Protección contra DDoS
El sistema implementa múltiples capas de protección contra DDoS:

1. **Nivel Nginx:**

    * Limitación de conexiones por IP
  
    * Limitación de tasas de solicitudes
    * Timeouts optimizados para conexiones lentas


2. **Nivel API Gateway:**

   * Rate limiting basado en Express
  
   * Circuit breaker para prevenir cascada de fallos
   * Filtrado de peticiones maliciosas


3. Nivel Aplicación:

   * Validación estricta de datos de entrada

   * Limitación de tamaño de solicitudes
   * Manejo de errores controlado

## 🚀 Instalación

Sigue estos pasos para configurar el proyecto en tu máquina:

1. **Clona el repositorio:**
    ```bash
    git clone https://github.com/<tu-usuario>/<tu-repositorio>.git
    cd <tu-repositorio>
    ```

2. **Configura el entorno:**
   Crea un archivo .env en el directorio raíz de cada servicio (auth-api, rooms-api, chat-api, api-gateway) si es necesario. 
    ```bash
    # Ejemplo para auth-api/.env
    PORT=3001
    MONGODB_URI=mongodb://mongo1:27017,mongo2:27017,mongo3:27017/auth_service?replicaSet=rs_auth
    JWT_SECRET=tu_secreto_super_seguro
    JWT_EXPIRE=24h
    API_ROOMS_URL=http://192.168.71.172:8002
    ```
Nota: Los valores por defecto están en los archivos docker-compose.

3. **Configura Nginx:**
   * Copia el archivo de configuración de Nginx proporcionado (nginx.TXT) a tu servidor Nginx.
   Asegúrate de que Nginx esté instalado:
   ```bash
    sudo apt update
    sudo apt install nginx
    ```

    * Coloca nginx.txt en /etc/nginx/nginx.conf

    * Verifica la configuración:sudo nginx -t

## Ejecución

* **Levanta los servicios con Docker Compose:**Ejecuta cada archivo Docker Compose en orden para evitar conflictos:
    ```bash
    docker-compose -f docker-compose-auth.yml up -d
    docker-compose -f docker-compose-rooms.yml up -d
    docker-compose -f docker-compose-chat.yml up -d
    docker-compose -f docker-compose-gateway.yml up -d
    ```

* **Inicia Nginx:**
  ```bash
  sudo systemctl start nginx
  ```
* **Levanta el frontend:** Navega al directorio del frontend y ejecuta:
  ```bash
    cd frontend
    npm install
    npm start
    ```

El frontend estará disponible en http://localhost:3000 (o el puerto configurado).


## Pruebas
Para verificar que todo funciona correctamente:

1. Verifica los contenedores:
    ```bash
    docker ps
    ```

    Deberías ver los contenedores de auth-api, rooms-api, chat-api, api-gateway, mongo, y redis en ejecución.

2. Prueba los endpoints de salud:Ejecuta estos comandos para confirmar que los servicios están activos:
    ```bash
    curl http://192.168.1.181:8000/health  # API Gateway
    curl http://192.168.1.181:8001/health  # Auth Service
    curl http://192.168.1.181:8002/health  # Rooms Service
    curl http://192.168.1.181:8003/health  # Chat Service
    ```

    Cada comando debería devolver OK.

3. Prueba el frontend:

   * Abre http://192.168.1.181:8000 en tu navegador.

   * Regístrate, inicia sesión, crea una sala y envía un mensaje.
   * Verifica que no haya errores en la consola del navegador (F12 > Console).


4. Revisa los logs si algo falla:
    ```bash
    docker logs <nombre-del-contenedor>
    ```

## Estructura del Proyecto
```
<tu-repositorio>/
├── auth-api/               # Código del servicio de autenticación
├── rooms-api/              # Código del servicio de salas
├── chat-api/               # Código del servicio de chat
├── api-gateway/            # Código del API Gateway
├── frontend/               # Código del frontend
├── docker-compose-auth.yml  # Configuración Docker para Auth Service
├── docker-compose-rooms.yml # Configuración Docker para Rooms Service
├── docker-compose-chat.yml  # Configuración Docker para Chat Service
├── docker-compose-gateway.yml # Configuración Docker para API Gateway y Redis
├── nginx.conf              # Configuración de Nginx
└── README.md               # Este archivo
```

## Solución de Problemas

1. **Error "mongo: command not found" en mongo-init:**
    * Asegúrate de que los servicios mongo-init usen mongosh en lugar de mongo (ver los archivos docker-compose).

   * Alternativa: Inicializa los replica sets manualmente:
    ```bash
    docker exec -it <mongo1-container> mongosh
    rs.initiate({...})  # Usa la configuración del archivo correspondiente
    ```

2. **Puertos en conflicto:**

   * Asegúrate de que los puertos 27017-27039, 6379, 3000-3013, y 8000-8003 no estén ocupados:sudo netstat -tulnp | grep <puerto>

3. **Frontend no conecta:**

   * Verifica que API_URL en frontend/src/utils/config.js apunte a http://192.168.1.181:8000.

    * Revisa los logs de Nginx:sudo cat /var/log/nginx/gateway_error.log


## Contribuciones
¡Las contribuciones son bienvenidas! Por favor:

* Haz un fork del repositorio.

* Crea una rama para tu cambio: git checkout -b mi-cambio.
* Commitea tus cambios: git commit -m "Descripción del cambio".
* Haz push a tu rama: git push origin mi-cambio.
* Abre un Pull Request.

### Licencia
Este proyecto está bajo la Licencia MIT. Consulta el archivo LICENSE para más detalles.
