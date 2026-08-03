package com.snailflix;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {

    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        webView = new WebView(this);
        setContentView(webView);

        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setDatabaseEnabled(true);
        
        // Fixes crashes on Chromebooks with hardware acceleration especialy you otis, wait why am i puting a converation in a comment nobody even reads these!!
        webView.setLayerType(WebView.LAYER_TYPE_HARDWARE, null);

    
        webView.setWebViewClient(new WebViewClient());

       
        webView.loadUrl("https://8493834.github.io/sps/snailflix.html");
    }
}
    }

    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
