<?php
session_start();
if (isset($_SESSION['nombre'])) {
    echo $_SESSION['nombre'];
} else {
    echo 'invitado';
}
?>