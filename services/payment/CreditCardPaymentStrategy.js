const PaymentStrategy = require('./PaymentStrategy');
const axios = require('axios');

class CreditCardPaymentStrategy extends PaymentStrategy {
  constructor() {
    super();
    this.paymentApiUrl = process.env.PAYMENT_API_URL || 'https://fakepayment.onrender.com/payments';
  }

  async processPayment(paymentDetails, amount) {
    // Simulación forzada (desarrollo): si PAYMENT_SIMULATE=true, no llamar al gateway
    if (process.env.PAYMENT_SIMULATE === 'true') {
      return { success: true, transactionId: 'txn_simulated_' + Date.now(), message: 'Pago simulado (PAYMENT_SIMULATE=true)' };
    }

    // In development, when no PAYMENT_API_KEY is configured, default to simulate payments
    // unless PAYMENT_SIMULATE is explicitly set to 'false'. This avoids 401/403 from the
    // external gateway when developers don't have API keys.
    if (process.env.NODE_ENV === 'development' && !process.env.PAYMENT_API_KEY && process.env.PAYMENT_SIMULATE !== 'false') {
      console.warn('No PAYMENT_API_KEY configured and running in development — simulating payment. Set PAYMENT_SIMULATE=false to force real gateway calls.');
      return { success: true, transactionId: 'txn_dev_simulated_' + Date.now(), message: 'Pago simulado (development, no PAYMENT_API_KEY)' };
    }

    // Durante tests, simular siempre pago exitoso para evitar llamadas externas
    // Allow forcing failure for testing/debugging: { forceFail: true }
    if (paymentDetails && paymentDetails.forceFail) {
      return { success: false, error: 'Pago forzado a fallar (forceFail=true)' };
    }

    if (process.env.NODE_ENV === 'test') {
      return {
        success: true,
        transactionId: 'txn_test_' + Date.now()
      };
    }
    try {
      // Validar datos requeridos
      if (!paymentDetails.cardToken || !paymentDetails.currency) {
        throw new Error('Faltan datos de pago requeridos: cardToken y currency');
      }

      const payload = {
        amount: amount.toFixed(2),
        currency: paymentDetails.currency || 'USD',
        cardToken: paymentDetails.cardToken,
        description: `Compra por $${amount.toFixed(2)}`
      };

      // Prepare headers: allow PAYMENT_API_KEY env var
      const headers = {};
      const apiKey = process.env.PAYMENT_API_KEY;
      const apiKeyHeader = process.env.PAYMENT_API_KEY_HEADER || 'Authorization';
      if (apiKey) {
        if (apiKeyHeader === 'Authorization') {
          headers['Authorization'] = `Bearer ${apiKey}`;
        } else {
          headers[apiKeyHeader] = apiKey;
        }
      }

      // Llamada a la API externa
      // Asegurar amount como número (algunas pasarelas esperan number)
      payload.amount = Number(payload.amount);

      let response;
      try {
        response = await axios.post(this.paymentApiUrl, payload, {
          headers,
          timeout: 10000 // 10 segundos timeout
        });
      } catch (err) {
        // Si recibimos 401/403 y hay apiKey, intentar con header alternativo
        if (err.response && (err.response.status === 401 || err.response.status === 403) && apiKey) {
          try {
            // Determinar header alternativo: si usamos Authorization, intentar X-API-Key; si usamos otra cabecera, intentar Authorization
            const altHeaders = {};
            if (apiKeyHeader === 'Authorization') {
              altHeaders['X-API-Key'] = apiKey;
            } else {
              altHeaders['Authorization'] = `Bearer ${apiKey}`;
            }
            console.warn('Primary payment header failed, retrying with alternative header.');
            response = await axios.post(this.paymentApiUrl, payload, { headers: altHeaders, timeout: 10000 });
          } catch (err2) {
            // llevar el error original al manejo posterior
            err = err2;
            response = err2.response;
          }
        } else {
          throw err; // Será manejado por el bloque catch externo
        }
      }

      if (response && response.data && response.data.status === 'success') {
        return {
          success: true,
          transactionId: response.data.transactionId,
          message: 'Pago procesado exitosamente'
        };
      } else {
        // Log para debugging
        const status = response ? response.status : 'no-response';
        const data = response ? response.data : null;
        console.error('Payment gateway rejected payment:', status, data);
        return {
          success: false,
          error: (data && (data.message || data.error)) || `Pago rechazado (status ${status})`
        };
      }
    } catch (error) {
      // Manejo específico de errores
      if (error.response) {
        // La API respondió con un error (ej. 401 Unauthorized)
        const status = error.response.status;
        const apiMsg = (error.response.data && error.response.data.message) ? error.response.data.message : null;
        console.error('Payment gateway error response:', status, apiMsg || error.response.data);

        let hint = '';
        if (status === 401) {
          hint = ' (401 Unauthorized). Revisa PAYMENT_API_KEY o credenciales hacia la pasarela.';
        }

        return {
          success: false,
          error: apiMsg || `Error en pago: ${status}` + hint
        };
      } else if (error.request) {
        // No se recibió respuesta
        console.error('No response from payment gateway:', error.message);
        return {
          success: false,
          error: 'No se pudo conectar con el servicio de pagos'
        };
      } else {
        // Error en configuración
        console.error('Payment strategy error:', error.message);
        return {
          success: false,
          error: error.message
        };
      }
    }
  }
}

module.exports = CreditCardPaymentStrategy;