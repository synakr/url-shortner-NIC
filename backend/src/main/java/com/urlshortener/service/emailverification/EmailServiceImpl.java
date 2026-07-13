package com.urlshortener.service.emailverification;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    @Autowired
    private SendGrid sendGrid;

    @Override
    public void sendEmail(String to, String subject, String content) {
        Email from = new Email("snaplink0107@gmail.com");
        Email toEmail = new Email(to);
        Content contentObj = new Content("text/html", content);
        Mail mail = new Mail(from, subject, toEmail, contentObj);

        Request request = new Request();
        try {

            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());
            System.out.println("DEBUG: Attempting to send email to " + to);
            Response response = sendGrid.api(request);
            System.out.println("DEBUG: SendGrid Status Code: " + response.getStatusCode());
            System.out.println("DEBUG: SendGrid Response Body: " + response.getBody());
            System.out.println("DEBUG: SendGrid Headers: " + response.getHeaders());
            if (response.getStatusCode() >= 300) {
                System.out.println("DEBUG: !!! SENDGRID RETURNED AN ERROR !!!");
            } else {
                System.out.println("DEBUG: SendGrid API call accepted (202).");
            }
        } catch (IOException ex) {
            throw new RuntimeException("Failed to send email", ex);
        }
    }
}