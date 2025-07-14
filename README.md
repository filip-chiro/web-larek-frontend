# Проектная работа "Веб-ларек"

Стек: HTML, SCSS, TS, Webpack

Структура проекта:
- src/ — исходные файлы проекта
- src/components/ — папка с TS компонентами
- src/components/base/ — папка с базовым кодом

Важные файлы:
- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/scss/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

## Установка и запуск
Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
```

или

```
yarn
yarn start
```
## Сборка

```
npm run build
```

или

```
yarn build
```

## Архитектура

- src/components/base - базовые классы, от Яндекс Практикума
- src/components/features - функциональные классы, которые реализуют определённые фичи
- src/services - сервисы, в которые выносится логика

Приложение стартует от класса AppController при вызове метода `AppController.init()`
AppController является главным классом приложения, который отвечает за инициализацию и управление всем приложением. Он создает экземпляры других классов и сервисов, а также инициализирует их.

Как работает `AppController`:

1. AppController создает экземпляры сервисов и компонентов приложения
2. AppController инициализирует сервисы и компоненты, передавая им необходимые данные и зависимости
3. Компоненты приложения используют сервисы для получения данных и отправки запросов на сервер
4. Сервисы используют API-эндпоинты для отправки запросов на сервер и получения данных
5. Компоненты приложения отображают данные и предоставляют интерфейс пользователя

В данном проекте используется паттерн MVVM(Model-View-ViewModel):
- Model: Сервисы представляют собой модель даных приложения
- View: Компоненты приложения представляют собой вид приложения
- ViewModel: AppController и сервисы представляют прослойку между моделью и видом, которая управляет данными и событиями

Описание всех остальных классов:

`ApiService` — базовый сервисный класс для работы с API. Он наследуется от класса `Api`, автоматически устанавливая базовый URL для всех HTTP-запросов. Используется как промежуточный слой, чтобы избежать повторяющегося указания базового URL в каждом конкретном API-сервисе. Не имеет своих методов, только наследует методы от `Api`

---

`ApiProductsService` - cервисный класс для взаимодействия с продуктами через API. Наследуется от ApiService

getAll(): Promise<Product[]>
  Выполняет GET-запрос к '/product'.
  Возвращает массив объектов Product, полученных из поля items ответа

getById(id: string): Promise<Product>
  Выполняет GET-запрос к '/product/{id}'.
  Возвращает объект Product по его идентификатору.

---

`ApiOrderService` - cервисный класс для отправки заказов на сервер. Наследуется от ApiService

send(createOrderRequest: CreateOrderRequest): Promise<CreateOrderResponse>
  Выполняет POST-запрос к '/order', отправляя данные заказа.
  Принимает объект createOrderRequest, содержащий информацию о заказе.
  Возвращает промис с объектом ответа CreateOrderResponse

---

`StatefulEventEmitterService` - класс, расширяющий EventEmitter, добавляет поддержку хранения последнего значения по каждому событию. Это облегчает работу с состоянием в реактивном UI

private _lastValues: Map<string, any>  
  Хранит последние данные, переданные при вызове emit для каждого события.
  Ключ — имя события, значение — данные последнего вызова

emit<T>(eventName: string, data?: T): void  
  Переопределяет стандартный emit.
  Сохраняет переданное значение data в _lastValues.
  Вызывает emit родительского класса (EventEmitter)

on<T>(eventName: EventName, callback: (event: T) => void): void  
  Переопределяет on родителя.
  Добавляет подписку на событие.
  Если для события уже есть сохранённое значение — сразу вызывает callback с этим значением

offAllByEventName(eventName: EventName): void  
  Удаляет все обработчики указанного события.
  Также удаляет последнее сохранённое значение этого события (если оно есть)

getLast<T = any>(eventName: string): T | undefined  
  Возвращает последнее сохранённое значение для события.
  Если данных нет — возвращает undefined

clearLast(eventName?: string): void  
  Если передано имя события — удаляет последнее значение только для него.
  Если аргумент не указан — очищает все сохранённые значения

---

`OrderService` - cервис, инкапсулирующий бизнес-логику создания и отправки заказа. Работает через брокер событий `StatefulEventEmitterService` и API-клиент `ApiOrderService`

getOrder(): Partial<Order>  
    Возвращает текущий объект заказа из состояния событий.
    Объединяет его с items: [], чтобы гарантировать наличие массива товаров даже при отсутствии данных.

getValidOrder(): Order  
    Проверяет валидность заказа с помощью isValid.
    Если заказ невалиден — выбрасывает ошибку.
    Если валиден — приводит Partial<Order> к полному Order и возвращает его.

sendOrder(): Promise<CreateOrderResponse>  
    Отправляет заказ на сервер через ApiOrderService.
    Предварительно проверяет валидность заказа.
    Возвращает Promise с результатом отправки или выбрасывает ошибку.

isValid(): boolean  
    Проверяет, заполнены ли все необходимые поля (email, address, phone, payment, items, total) в текущем заказе.
    Возвращает true — если заказ валиден, иначе false.

setPaymentMethod(paymentMethod: Payment): void  
    Обновляет метод оплаты в заказе.
    Отправляет новое состояние заказа через StatefulEventEmitterService.

setAddress(address: string): void  
    Устанавливает адрес доставки в заказ.
    Эмитирует новое состояние заказа.

setEmail(email: string): void  
    Устанавливает email пользователя в заказ.
    Эмитирует обновлённое состояние.

setPhone(phone: string): void  
    Устанавливает телефон пользователя в заказ.
    Эмитирует обновлённое состояние.

setProducts(products: Product[], basketPrice: number): void  
    Устанавливает список товаров и общую сумму заказа.
    Передаёт только id товаров, без всей модели.

clear(): void  
    Удаляет все подписки и сохранённые данные, связанные с событием ORDER

---
`BasketService` - cервис, управляющий корзиной товаров. Использует брокер событий StatefulEventEmitterService для хранения и трансляции состояния корзины

getAll(): Product[]  
    Возвращает список всех товаров в корзине.
    Если данные отсутствуют — возвращает пустой массив.

getById(id: string): Product | undefined  
    Ищет товар по ID в текущем состоянии корзины.
    Возвращает найденный товар или undefined, если такого нет.

getPriceBasket(): number  
    Считает и возвращает общую стоимость всех товаров в корзине.

add(product: Product): void  
    Добавляет товар в корзину, если он ещё не добавлен.
    Эмитирует события:
        add-card-to-basket-{id} — добавление конкретного товара.
        remove-card-to-basket-{id} — удаление соответствующих подписчиков.
        BASKET — обновлённое состояние корзины.

remove(product: Product): void  
    Удаляет товар из корзины по ID.
    Эмитирует события:
        remove-card-to-basket-{id} — факт удаления товара.
        BASKET — обновлённое состояние корзины.

onBasket(callback: (products: Product[]) => void): void  
    Подписывает переданный callback на изменения в корзине (EventNames.BASKET).

offBasket(callback: (products: Product[]) => void): void  
    Удаляет переданный callback из подписки на изменения корзины.

onBasketById(id: string, callback: (product: Product) => void): void  
    Подписывает обработчик на событие добавления конкретного товара по ID.

offBasketById(id: string): void  
    Удаляет все подписки, связанные с добавлением конкретного товара по ID.

clear(): void  
    Полностью очищает корзину, эмитируя пустой список товаров в EventNames.BASKET

---

**ModalComponent**

Базовый абстрактный класс модального окна. Отвечает за управление отображением модального контейнера и взаимодействием с пользователем через DOM.

**Свойства**  
private _modalContainerElement: HTMLElement
    Контейнер модального окна (#modal-container).

private _modalContentElement: HTMLElement  
    Элемент, в который вставляется контент модального окна (.modal__content).

private _modalCloseElement: HTMLElement
    Кнопка закрытия модального окна (.modal__close).

protected _openCallback: () => void  
    Коллбэк, вызываемый при открытии модального окна. По умолчанию — пустая функция.

protected _closeCallback: () => void  
    Коллбэк, вызываемый при закрытии модального окна. По умолчанию — пустая функция.

private _isRender: boolean  
    Флаг, указывающий, был ли отрендерен контент модального окна.

private _isOpen: boolean  
    Флаг, указывающий, открыто ли модальное окно.

**Методы**

protected _renderModalContent(contentElement: HTMLElement): void  
    Очищает содержимое модального окна.
    Инициализирует события.
    Вставляет переданный DOM-элемент внутрь модального контента.
    Устанавливает флаг _isRender = true.

private _initEventListeners(): void  
    Вешает обработчик на кнопку закрытия модального окна (по клику).

protected _open(): void  
    Открывает модальное окно:
        Проверяет, был ли предварительно отрендерен контент.
        Добавляет классы отображения.
        Вешает слушатели на нажатие клавиши Escape и клик по фону.
        Вызывает _openCallback().

protected _close(): void  
    Закрывает модальное окно:
        Проверяет, был ли отрендерен контент.
        Убирает классы отображения.
        Снимает слушатели событий.
        Вызывает _closeCallback().

private _closeByOverlay = (event: Event): void  
    Закрывает модальное окно при клике по оверлею (вне контента).

private _closeByEsc = (event: KeyboardEvent): void  
    Закрывает модальное окно при нажатии клавиши Escape

---

**ModalSuccessOrderComponent**

Компонент отображения модального окна успешного оформления заказа. Наследуется от ModalComponent.

**Свойства**

private readonly _successOrderTemplate: HTMLTemplateElement  
    DOM-шаблон для модального окна успеха заказа. Ищется по селектору #success.

**Методы**

open(): void  
    Открывает модальное окно:  
        Рендерит шаблон с итогами заказа.
        Вызывает метод _open() родительского класса.

close(): void  
    Закрывает модальное окно через метод _close() родителя.

private _renderModalContentSuccessOrder(): void  
    Подготавливает и вставляет контент модального окна:  
      ---  Клонирует HTML-шаблон успеха.  
      ---  Заполняет текстовое описание списанной суммы.  
      ---  Назначает обработчик кнопке закрытия.  
      ---  Устанавливает _closeCallback для очистки заказа и корзины.  
      ---  Вызывает _renderModalContent() для вставки контента в DOM.

---

**ModalPaymentAddressOrderComponent**

Компонент отображения модального окна для ввода адреса и выбора способа оплаты при оформлении заказа. Наследуется от ModalComponent.

**Свойства**

private readonly _paymentAddressOrderTemplate: HTMLTemplateElement  
    HTML-шаблон модального окна, загружаемый по селектору #order.

**Методы**

open(): void  
    Открывает модальное окно:  
        Рендерит содержимое с формой выбора оплаты и адреса.  
        Вызывает _open() родительского класса.

close(): void  
    Закрывает модальное окно через _close() родителя.

private _renderModalContentPaymentAddressOrder(): void  
  Рендерит и вставляет контент формы:  
      Подготавливает элементы формы: адрес, кнопки выбора оплаты, кнопка отправки и блок ошибок.  
      Устанавливает обработчики событий для:  
          выбора способа оплаты;  
          ввода адреса с валидацией;  
          отправки формы (устанавливает данные заказа и инициирует переход к следующему шагу).  
      Задаёт _closeCallback, очищающий заказ при закрытии модалки.
      Вызывает _renderModalContent().

private _validateForm(...)  
    Проверяет корректность адреса доставки:  
        Вызывает отрисовку ошибок адреса.  
        Блокирует кнопку отправки, если поле пустое.

private _setPaymentMethod(...)  
    Обновляет активное состояние кнопок выбора способа оплаты:  
        Добавляет/удаляет CSS-классы активности в зависимости от выбранного метода (online или offline).

private _renderAddressErrors(...)  
    Отображает сообщение об ошибке, если поле адреса пустое.

---

**ModalEmailPhoneOrderComponent**

Компонент модального окна для ввода email и телефона при оформлении заказа. Наследуется от ModalComponent.

**Свойства**

private readonly _contactsTemplate: HTMLTemplateElement  
    HTML-шаблон формы контактов, загружаемый из документа по селектору #contacts.

**Методы**

open(): void  
    Открывает модальное окно:  
        Рендерит форму для ввода email и телефона.  
        Вызывает метод _open() базового класса.

close(): void  
    Закрывает модальное окно с помощью _close() родительского класса.

private _renderModalContentEmailPhoneOrder(): void  
    Рендерит содержимое модального окна с формой:  
        Создаёт элементы формы: поля email, телефона, кнопку отправки, блок ошибок.  
        Навешивает обработчики событий на ввод в поля для валидации и отображения ошибок.  
        Устанавливает _closeCallback, который очищает состояние заказа.  
        Обрабатывает отправку формы:  
            Устанавливает email, телефон и товары заказа в OrderService.  
            Проверяет валидность заказа.  
            Отправляет заказ через сервис, обрабатывает ошибку и при успехе запускает событие открытия окна успешного заказа.  
        Вставляет сгенерированный контент в модальное окно.  

private _renderEmailErrors(inputEmailElement: HTMLInputElement, formEmailErrorsElement: HTMLSpanElement): void
    Отображает ошибку, если поле email пустое.

private _renderPhoneErrors(inputPhoneElement: HTMLInputElement, formPhoneErrorsElement: HTMLSpanElement): void  
    Отображает ошибку, если поле телефона пустое.

private _validateForm(inputEmailElement: HTMLInputElement, inputPhoneElement: HTMLInputElement, btnSubmitElement: HTMLButtonElement): void  
    Управляет состоянием кнопки отправки:  
        Блокирует кнопку, если email или телефон не заполнены.

---

**ModalCardFullComponent**

Класс ModalCardFullComponent представляет собой модальное окно для отображения полной информации о товаре с возможностью добавления или удаления товара из корзины.

**Свойства**

  private readonly _cardFullTemplateElement: HTMLTemplateElement
  Хранит HTML-шаблон для полной карточки товара.  
  protected override _closeCallback: () => void
  Переопределяемый коллбек, вызываемый при закрытии модального окна (по умолчанию пустая функция).  

**Методы**

  open(product: Product): void  
  Открывает модальное окно и рендерит в нём полную карточку переданного товара.

  close(): void  
  Закрывает модальное окно.

  private _renderModalContentCardFull(product: Product): void  
  Создаёт содержимое модального окна с данными товара: категория, название, изображение, цена и кнопка действия.  
  Кнопка меняет текст и состояние в зависимости от наличия товара в корзине и его цены.  
  Добавляет обработчик клика по кнопке.

  private _clickCardBtn(product: Product, cardBtn: HTMLButtonElement): void  
  Обрабатывает нажатие кнопки: если товар есть в корзине — удаляет и меняет текст кнопки на "Купить", если нет — добавляет и меняет текст на "Удалить из корзины"

---

**ModalBasketComponent**

Класс ModalBasketComponent отвечает за отображение модального окна с содержимым корзины. Он позволяет пользователю просматривать добавленные товары, видеть общую стоимость и переходить к оформлению заказа

**Свойства**
  private readonly _basketTemplate: HTMLTemplateElement  
  Шаблон HTML-разметки модального окна корзины, получаемый из DOM.

**Методы**

  open(): void  
  Открывает модальное окно корзины. Сначала вызывает метод отрисовки содержимого, затем активирует отображение через базовый метод _open().

  close(): void  
  Закрывает модальное окно с помощью базового метода _close().

  private _renderModalContentBasket(): void  
  Отрисовывает содержимое корзины. Подготавливает шаблон, очищает список, добавляет слушатель на кнопку оформления, рендерит элементы товаров и регистрирует подписку на обновления корзины. Также задаёт обработчик для очистки подписки при закрытии модального окна.

  private _appendBasketElements(listElement: HTMLUListElement, products: Product[]): void  
  Добавляет в DOM карточки всех товаров, переданных в products, используя компонент BasketCardComponent.

  private _renderActionsInfo(submitBtnElement: HTMLButtonElement, priceElement: HTMLSpanElement, listElement: HTMLUListElement, priceBasket: number): void  
  Обновляет информацию о цене корзины и доступности кнопки оформления. Если корзина пуста — отображает сообщение об этом и отключает кнопку оформления заказа

---

**GalleryComponent**

Класс GalleryComponent предназначен для отображения списка товаров в галерее на странице. Он управляет отрисовкой карточек товаров, используя переданный компонент карточки каталога

**Свойства**
  private readonly _galleryElement: HTMLElement  
  DOM-элемент галереи, в который будут добавляться карточки товаров. Инициализируется по селектору .gallery.

**Методы**

  renderProductList(products: Product[]): void  
  Отображает список товаров, переданный в виде массива. Для каждого товара создаётся карточка через CardCatalogComponent, после чего она добавляется в DOM внутри элемента галереи

---

**CardCatalogComponent**

Класс CardCatalogComponent отвечает за создание карточек товаров для отображения в каталоге. Он инкапсулирует логику генерации карточки и обработки клика по ней

**Свойства**

  private readonly _cardCatalogTemplateElement: HTMLTemplateElement
  Ссылка на HTML-шаблон карточки каталога, получаемая из DOM по селектору #card-catalog.

**Методы**

  createElement(product: Product): HTMLElement  
  Создаёт DOM-элемент карточки товара на основе шаблона. Заполняет элементы карточки данными товара: категорией, заголовком, изображением и ценой. Назначает обработчик клика на карточку, вызывающий внутренний метод _cardCatalogClick.

  private _cardCatalogClick(product: Product): void  
  Обрабатывает клик по карточке каталога. Генерирует событие OPEN_CARD_FULL с данными товара, используя StatefulEventEmitterService. Это событие может быть использовано для открытия модального окна с подробной информацией о товаре

---

**BasketHeaderComponent**

Класс BasketHeaderComponent предназначен для отображения и обновления информации о корзине в шапке сайта. Также он обрабатывает клик по иконке корзины для открытия модального окна с её содержимым.

**Свойства**

  private readonly _headerBasketElement: HTMLElement  
  Ссылка на DOM-элемент корзины в шапке (.header__basket).

  private readonly _counterElement: HTMLElement  
  Ссылка на элемент счётчика количества товаров в корзине (.header__basket-counter).

**Методы**

  setQuantityProductsInBasket(quantity: number): void  
  Обновляет текстовое содержимое счётчика товаров в корзине, устанавливая переданное количество.

  private _initEventListeners(): void  
  Назначает обработчик клика по элементу корзины. При клике испускается событие OPEN_CART через StatefulEventEmitterService, что может использоваться для отображения модального окна корзины.

---

**BasketCardComponent**

Класс BasketCardComponent отвечает за создание DOM-элемента карточки товара, отображаемой в корзине. Он инкапсулирует логику визуализации одного элемента списка корзины и обработку удаления товара.

**Свойства**

  private readonly _basketCardTemplate: HTMLTemplateElement  
  Ссылка на HTML-шаблон карточки товара в корзине (#card-basket), используемый для клонирования DOM-элемента.

**Методы**

  createElement(product: Product, index: number): HTMLLIElement  
  Создаёт и возвращает элемент карточки товара на основе шаблона.  
  Устанавливает:  
    порядковый номер (index + 1),  
    название товара,  
    цену товара в текстовом виде.
    Также добавляет обработчик на кнопку удаления, который вызывает приватный метод _deleteProduct.

  private _deleteProduct(product: Product): void  
  Удаляет товар из корзины, вызывая метод remove у BasketService

---

Модели данных и типы:

**Типы и интерфейсы**

ProductCategory  
Тип, определяющий возможные категории продукта

```
type ProductCategory = 'софт-скил' | 'другое' | 'дополнительное' | 'кнопка' | 'хард-скил';
```
---

Интерфейс описывает товар:  
  id — уникальный идентификатор товара.  
  description — описание товара.  
  image — ссылка на изображение.  
  title — название.  
  category — категория (тип ProductCategory).  
  price — цена товара или null, если товар недоступен для покупки.

```
interface Product {
  id: string;
  description: string;
  image: string;
  title: string;
  category: ProductCategory;
  price: number | null;
}
```

---

Payment

```
type Payment = 'online' | 'offline';
```

Тип метода оплаты:  
  'online' — онлайн-оплата,  
  'offline' — оплата при получении

---

CreateOrderRequest

```
interface CreateOrderRequest {
  payment: Payment;
  email: string;
  phone: string;
  address: string;
  total: number;
  items: string[];
}
```

Интерфейс для отправки заказа:  
  payment — способ оплаты.  
  email — адрес электронной почты покупателя.  
  phone — номер телефона.  
  address — адрес доставки.  
  total — итоговая сумма заказа.
  items — массив id товаров в заказе

---

CreateOrderResponse

```
interface CreateOrderResponse {
  id: string;
  total: number;
}
```

Ответ сервера на создание заказа:
  id — идентификатор созданного заказа.
  total — подтверждённая сумма

---

GetAllProductsResponse

```
interface GetAllProductsResponse {
  total: number;
  items: Product[];
}
```

Ответ API при получении списка продуктов:  
  total — общее количество товаров.  
  items — массив объектов типа Product

---

Order

```
interface Order {
  payment: Payment;
  email: string;
  phone: string;
  address: string;
  total: number;
  items: string[];
}
```

Полное представление заказа в приложении (аналог CreateOrderRequest), может использоваться локально.

---

Перечисление  
EventNames

```
enum EventNames {
  OPEN_CARD_FULL = 'open-card-full',
  BASKET = 'basket',
  OPEN_CART = 'open-cart',
  ORDER = 'order',
  OPEN_ORDER_ADDRESS_PAYMENT = 'open-order-address-payment',
  OPEN_ORDER_EMAIL_PHONE = 'open-order-email-phone',
  OPEN_SUCCESS_ORDER = 'open-success-order',
}
```

Перечисление ключевых событий в приложении. Используется для взаимодействия между компонентами через событийную систему

---

Объект сопоставления  
categoryCompareObj

```
const categoryCompareObj = {
  'софт-скил': 'soft',
  'дополнительное': 'additional',
  'другое': 'other',
  'кнопка': 'button',
  'хард-скил': 'hard'
};
```

Объект, сопоставляющий внутренние категории (ProductCategory). Используется для задания CSS классов для категорий.