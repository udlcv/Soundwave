# Usamos la imagen oficial de PHP con Apache
FROM php:8.2-apache

# Instalamos extensiones PHP necesarias para MySQL
RUN docker-php-ext-install mysqli pdo pdo_mysql

# Actualizamos e instalamos dependencias
RUN apt-get update && apt-get install -y \
    libzip-dev \
    zip \
    unzip \
    git \
    && docker-php-ext-install zip

# Habilitamos mod_rewrite para Apache
RUN a2enmod rewrite

# Configuramos el directorio de trabajo
WORKDIR /var/www/html

# Copiamos el código fuente de la aplicación
COPY . /var/www/html/

# Aseguramos que los archivos tengan los permisos correctos
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html

# Exponemos el puerto 80 para acceder a la aplicación web
EXPOSE 80

# Configuramos Apache para escuchar en el puerto proporcionado por Railway
CMD sed -i "s/80/$PORT/g" /etc/apache2/sites-available/000-default.conf /etc/apache2/ports.conf && apache2-foreground