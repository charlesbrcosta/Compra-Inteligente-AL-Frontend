import { WebView } from 'react-native-webview';

export function MapHtmlView({ html }: { html: string }) {
  return (
    <WebView
      originWhitelist={['*']}
      javaScriptEnabled
      domStorageEnabled
      source={{ html }}
      style={{ backgroundColor: '#e2e8f0', flex: 1 }}
    />
  );
}
