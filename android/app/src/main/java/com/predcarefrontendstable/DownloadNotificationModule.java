package com.predcarefrontendstable;

import android.app.DownloadManager;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import androidx.core.app.NotificationCompat;
import androidx.core.content.FileProvider;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.io.File;

public class DownloadNotificationModule extends ReactContextBaseJavaModule {

    private static final String CHANNEL_ID = "pdf_downloads_channel";

    public DownloadNotificationModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "DownloadNotificationModule";
    }

    @ReactMethod
    public void notifyDownloadComplete(String filePath, String fileName, String title, String message, Promise promise) {
        try {
            Context context = getReactApplicationContext();
            File file = new File(filePath);

            if (!file.exists()) {
                promise.reject("FILE_NOT_FOUND", "Downloaded file does not exist at path: " + filePath);
                return;
            }

            // 1. Add to Android System DownloadManager
            try {
                DownloadManager dm = (DownloadManager) context.getSystemService(Context.DOWNLOAD_SERVICE);
                if (dm != null) {
                    dm.addCompletedDownload(
                        fileName,
                        message != null ? message : fileName,
                        true,
                        "application/pdf",
                        file.getAbsolutePath(),
                        file.length(),
                        true
                    );
                }
            } catch (Exception e) {
                // Ignore if DownloadManager registration fails on specific custom ROMs
            }

            // 2. Post Custom System Status Bar Notification with Tap-to-Open Intent
            NotificationManager notificationManager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "File Downloads",
                    NotificationManager.IMPORTANCE_DEFAULT
                );
                channel.setDescription("Notifications for downloaded PDF invoices and files");
                if (notificationManager != null) {
                    notificationManager.createNotificationChannel(channel);
                }
            }

            Intent intent = new Intent(Intent.ACTION_VIEW);
            Uri contentUri;
            try {
                contentUri = FileProvider.getUriForFile(
                    context,
                    context.getPackageName() + ".provider",
                    file
                );
            } catch (Exception ex) {
                contentUri = Uri.fromFile(file);
            }

            intent.setDataAndType(contentUri, "application/pdf");
            intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

            int pendingIntentFlags = PendingIntent.FLAG_UPDATE_CURRENT;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                pendingIntentFlags |= PendingIntent.FLAG_IMMUTABLE;
            }

            PendingIntent pendingIntent = PendingIntent.getActivity(
                context,
                (int) System.currentTimeMillis(),
                intent,
                pendingIntentFlags
            );

            NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
                .setSmallIcon(android.R.drawable.stat_sys_download_done)
                .setContentTitle(title != null && !title.isEmpty() ? title : "Download Complete")
                .setContentText(message != null && !message.isEmpty() ? message : fileName)
                .setAutoCancel(true)
                .setPriority(NotificationCompat.PRIORITY_DEFAULT)
                .setContentIntent(pendingIntent);

            if (notificationManager != null) {
                notificationManager.notify((int) (System.currentTimeMillis() % Integer.MAX_VALUE), builder.build());
            }

            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("NOTIFICATION_ERROR", e.getMessage(), e);
        }
    }
}
