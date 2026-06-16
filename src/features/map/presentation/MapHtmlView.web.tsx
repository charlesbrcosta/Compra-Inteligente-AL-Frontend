import { createElement } from 'react';

export function MapHtmlView({ html }: { html: string }) {
  const srcDoc = html.replace(/<\/script>/g, '<\\/script>');

  return createElement('iframe', {
    srcDoc,
    title: 'Mapa interativo da rota',
    style: {
      border: 0,
      height: '100%',
      width: '100%',
    },
  });
}
