<?php
  require "../../vendor/autoload.php"; 

  if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo "Error: Please submit the form properly.";
    exit;
  }

  
  if (!isset($_POST["email"]) || empty($_POST["email"])) {
    echo "Error: Email address is required.";
    exit;
  }

  $email = $_POST["email"]; 

  
  if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo "Error: Invalid email format.";
    exit;
  }

  use PHPMailer\PHPMailer\PHPMailer; 
  use PHPMailer\PHPMailer\SMTP; 
  use PHPMailer\PHPMailer\Exception;

  $mail = new PHPMailer(true); 

  try {
    $mail->isSMTP(); 
    $mail->SMTPAuth = true; 

    
    $mail->Host = "smtp.gmail.com"; 
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS; 
    $mail->Port = 587; 
    
    
    $mail->Username = "cedrickced820@gmail.com";
    $mail->Password = "abcjsrbtmsztdkio"; 

    $mail->setFrom("cedrickced820@gmail.com", "The Philippine Artisan");
    $mail->addAddress($email);

    $mail->Subject = "Welcome to The Philippine Artisan"; 
    $mail->Body = "Thank you for subscribing with email: {$email}"; 

    $mail->send(); 
    
    echo "Email Sent!"; 
  } catch (Exception $e) {
    echo "Message could not be sent. Mailer Error: {$mail->ErrorInfo}";
  }
?>