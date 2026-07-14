# React Player

`React Player` — компонент для воспроизведения видео.
Он анализирует переданную ссылку и автоматически выбирает подходящий плеер.
Если ссылка не поддерживается, используется стандартный HTML-тег `<video>`.

## Поддерживаемые плееры
- **YouTube** — ссылка берётся через кнопку «Поделиться»;
- **RuTube** — ссылка берётся из атрибута `src` тега `<iframe>`, доступного в коде вставки при выборе «Поделиться»;
- **VK** — используется прямая ссылка на видео.

## Превью
Можно указать изображение-превью, которое будет отображаться до загрузки плеера. Как только плеер загрузится, отобразится кнопка, при нажатии которого превью уйдет, и запустится плеер.

```ts
preview: {
  src: string;
  alt: string;
};
```

## Кастомизация
В плеер можно кастомизировать изображение и кнопку, которые будут показываться, если есть превью.

```ts
components={
  button: {
    /** компонент */
    component: FCClass;
    /** его пропсы */
    props?: Record<string, any>;
  },
  previewPicture: {
    component: FCClass;
    props?: Record<string, any>;
  },
}
```

```tsx
const PlayButton = (props) => (
  <button {...props}>▶ Play</button>
);

const PreviewImage = () => (
  <img src='src/img' />
);

<Player
  url={url}
  components={{
    button: {
      component: PlayButton,
      props: {
        type: "button"
      }
    },
    previewPicture: {
      component: PreviewImage,
    },
  }}
/>
```

Также можно прокинуть класс на сам плеер, если есть превью.

```ts
classNames={
  player: 'custom-class'
}
```

## Стили
Импорт такой:

```ts
import '@barabel324/react-player/css';
```

## Пропсы

```ts
type TPlayer = {
  /** Превью для видео */
  preview?: TPlayerPreview['preview'];
  /** Ссылка на видео */
  url: TPlayerBase['url'];
  /** кастомные компоненты либы */
  components?: TComponents;
  /** кастомные классы для компонентов либы */
  classNames?: TClassNames;
};
```

## Минимальный пример

```tsx
  import { Player } from '@barabel324/react-player';
  import '@barabel324/react-player/css';

  const urls = {
    youtube: 'https://www.youtube.com/watch?v=0r9iEuDCnrw',
    video: 'https://archive.org/download/BigBuckBunny_124/Content/big_buck_bunny_720p_surround.mp4',
    rutube: 'https://rutube.ru/play/embed/20c1db3c9680dd6c11c5196e115389c3/',
    vk: 'https://vkvideo.ru/video-230010077_456239088',
  };

  const urlsValues = Object.values(urls);

  const App = () => {
    return (
      <div>
        {urlsValues.map((url, index) => {
          return (
            <div
              key={index}
              style={{
                margin: 50,
                width: 300,
                height: 300,
              }}
            >
              <Player
                preview={{
                  src: 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcRicvXHENnmfMs08gwqqleKpIFIDyYXvABiotI69IImEyfxZBXVIos5QqecafJKRFV5a76EttukpAtA0O6-y9ujsgrgpwb0TbLedjYNo38',
                  alt: 'preview',
                }}
                url={url}
              />
            </div>
          );
        })}
      </div>
    )
  };
```
