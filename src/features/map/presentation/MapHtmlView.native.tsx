import { WebView } from 'react-native-webview';
import { ActivityIndicator, Text, View } from 'react-native';
import { useEffect, useMemo, useState } from 'react';

export function MapHtmlView({ html }: { html: string }) {
  const [reloadAttempt, setReloadAttempt] = useState(0);
  const webViewKey = useMemo(() => `${createSimpleHash(html)}-${reloadAttempt}`, [html, reloadAttempt]);

  useEffect(() => {
    setReloadAttempt(0);
  }, [html]);

  return (
    <WebView
      key={webViewKey}
      originWhitelist={['*']}
      javaScriptEnabled
      domStorageEnabled
      mixedContentMode="always"
      setSupportMultipleWindows={false}
      startInLoadingState
      renderLoading={() => (
        <View className="flex-1 items-center justify-center bg-slate-100">
          <ActivityIndicator color="#D62839" />
          <Text className="mt-2 text-xs font-semibold text-slate-600">Carregando mapa...</Text>
        </View>
      )}
      onError={() => setReloadAttempt((current) => (current < 2 ? current + 1 : current))}
      injectedJavaScript="setTimeout(function(){ window.dispatchEvent(new Event('resize')); }, 250); true;"
      source={{ html }}
      style={{ backgroundColor: '#e2e8f0', flex: 1 }}
    />
  );
}

function createSimpleHash(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0;
  }

  return String(hash);
}
