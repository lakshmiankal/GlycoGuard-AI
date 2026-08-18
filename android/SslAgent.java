import javax.net.ssl.*;
import java.security.SecureRandom;
import java.security.cert.X509Certificate;
import java.lang.instrument.Instrumentation;

public class SslAgent {
    public static void premain(String agentArgs, Instrumentation inst) {
        disableSsl();
    }

    public static void agentmain(String agentArgs, Instrumentation inst) {
        disableSsl();
    }

    private static void disableSsl() {
        try {
            TrustManager[] trustAllCerts = new TrustManager[]{
                new X509TrustManager() {
                    public X509Certificate[] getAcceptedIssuers() { return null; }
                    public void checkClientTrusted(X509Certificate[] certs, String authType) {}
                    public void checkServerTrusted(X509Certificate[] certs, String authType) {}
                }
            };
            SSLContext sc = SSLContext.getInstance("SSL");
            sc.init(null, trustAllCerts, new SecureRandom());
            HttpsURLConnection.setDefaultSSLSocketFactory(sc.getSocketFactory());
            HttpsURLConnection.setDefaultHostnameVerifier((hostname, session) -> true);
            System.setProperty("jsse.enableSNIExtension", "true");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
