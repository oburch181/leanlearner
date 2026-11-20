package dev.leanprover.nng4;

import android.os.Bundle;
import android.view.View;
import android.view.Window;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        applyLightSystemBars();
    }

    @Override
    public void onResume() {
        super.onResume();
        applyLightSystemBars();
    }

    private void applyLightSystemBars() {
        Window window = getWindow();
        if (window == null) {
            return;
        }
        View decorView = window.getDecorView();
        WindowInsetsControllerCompat controller = WindowCompat.getInsetsController(window, decorView);
        if (controller != null) {
            controller.show(WindowInsetsCompat.Type.systemBars());
            controller.setAppearanceLightStatusBars(true);
            controller.setAppearanceLightNavigationBars(true);
        }
    }
}
