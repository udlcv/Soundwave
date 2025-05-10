# Usar imagen base de PHP con Apache
FROM php:8.1-apache

# Instalar dependencias necesarias
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) gd

# Habilitar mod_rewrite de Apache
RUN a2enmod rewrite

# Instalar extensiones PHP necesarias para tu aplicación
RUN docker-php-ext-install mysqli pdo pdo_mysql

# Copiar archivos del proyecto al directorio raíz de Apache
COPY . /var/www/html/

# Establecer permisos correctos
RUN chown -R www-data:www-data /var/www/html/
RUN chmod -R 755 /var/www/html/

# Exponer puerto 80
EXPOSE 80

# Ejecutar Apache
CMD ["apache2-foreground"]