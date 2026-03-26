import { useState, useMemo, useEffect } from 'react'

// ═══════════════════════════════════════════════════════
//  CONFIG — ЗАМЕНИТЕ ЗДЕСЬ
// ═══════════════════════════════════════════════════════
const WHATSAPP = '77023782392'   // ← Ваш номер WhatsApp без + и пробелов

// ═══════════════════════════════════════════════════════
//  CSV PARSER
// ═══════════════════════════════════════════════════════
function parsePrice(raw) {
  // Убирает пробелы, запятые и ".00" → число
  return parseInt(String(raw).replace(/\s/g, '').replace(',00', '').replace(',', ''), 10) || 0
}

function parseCSV(text) {
  const lines = text.trim().split('\n').slice(1) // пропускаем заголовок
  return lines.map(line => {
    // Корректно разбиваем строку с учётом кавычек
    const cols = []
    let cur = '', inQ = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') { inQ = !inQ }
      else if (ch === ',' && !inQ) { cols.push(cur.trim()); cur = '' }
      else { cur += ch }
    }
    cols.push(cur.trim())

    const [name, category, , , , photo, priceRaw] = cols
    const id = photo ? photo.replace(/\.(jpeg|jpg|png)$/i, '') : ''
    return { id, name: name || '', category: category || '', price: parsePrice(priceRaw) }
  }).filter(p => p.id && p.name)
}

// ═══════════════════════════════════════════════════════
//  ХУК — загружаем CSV из public/data.csv
// ═══════════════════════════════════════════════════════
function useProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  useEffect(() => {
    fetch('/data.csv')
      .then(r => { if (!r.ok) throw new Error('CSV не найден'); return r.text() })
      .then(text => { setProducts(parseCSV(text)); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [])

  return { products, loading, error }
}

const PRICE_RANGES = [
  { label: 'Все цены',          min: 0,       max: Infinity   },
  { label: 'до 500 000 ₸',      min: 0,       max: 500000     },
  { label: '500 000 — 1 млн ₸', min: 500000,  max: 1000000    },
  { label: '1 — 5 млн ₸',       min: 1000000, max: 5000000    },
  { label: 'свыше 5 млн ₸',     min: 5000000, max: Infinity   },
]

// ═══════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════
const fmt = (n) => new Intl.NumberFormat('ru-RU').format(n) + ' ₸'

const waUrl = (p) =>
  `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
    `Здравствуйте! Меня интересует «${p.name}» (арт. ${p.id}). Хотел бы узнать подробнее.`
  )}`

const waGeneral = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
  'Здравствуйте! Хочу узнать подробнее о вашей продукции.'
)}`

// ═══════════════════════════════════════════════════════
//  ICONS
// ═══════════════════════════════════════════════════════
function IconWa() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}

function IconSearch() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
  )
}

function IconChevron() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m6 9 6 6 6-6"/>
    </svg>
  )
}

// ═══════════════════════════════════════════════════════
//  HEADER
// ═══════════════════════════════════════════════════════
function Header({ scrolled }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className={`header${scrolled ? ' header--solid' : ''}`}>
      <div className="header__inner container">
        <a href="#top" className="header__logo">
          <img src="/logo.png" alt="vkvadrate almaty" width="40" height="40" />
          <div className="header__logo-text">
            <span className="header__logo-name">vkvadrate</span>
            <span className="header__logo-city">almaty</span>
          </div>
        </a>

        <nav className="header__nav" aria-label="Навигация">
          <a href="#catalog">Каталог</a>
          <a href="#about">О нас</a>
          <a href="#contact">Контакты</a>
        </nav>

        <a href={waGeneral} className="header__cta btn-wa" target="_blank" rel="noopener noreferrer">
          <IconWa />
          <span>Написать нам</span>
        </a>

        <button
          className={`burger${menuOpen ? ' burger--open' : ''}`}
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Меню"
        >
          <span/><span/><span/>
        </button>
      </div>

      {menuOpen && (
        <div className="mobile-menu">
          <a href="#catalog" onClick={() => setMenuOpen(false)}>Каталог</a>
          <a href="#about" onClick={() => setMenuOpen(false)}>О нас</a>
          <a href="#contact" onClick={() => setMenuOpen(false)}>Контакты</a>
          <a href={waGeneral} className="mobile-menu__wa" target="_blank" rel="noopener noreferrer">
            <IconWa /> Написать в WhatsApp
          </a>
        </div>
      )}
    </header>
  )
}

// ═══════════════════════════════════════════════════════
//  HERO
// ═══════════════════════════════════════════════════════
function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero__overlay" />
      <div className="hero__content container">
        <div className="hero__left">
          <p className="hero__eyebrow">Алматы · Казахстан</p>
          <h1 className="hero__title">
          Благоустройство городских пространств<br />
            <em>от идеи<br />до установки</em>
          </h1>
          <p className="hero__sub">
            Скамьи, перголы, МАФ, спортивное оборудование
            и освещение для парков, дворов и общественных пространств
          </p>
          <div className="hero__actions">
            <a href="#catalog" className="hero__btn-primary">Смотреть каталог</a>
            <a href={waGeneral} className="hero__btn-outline" target="_blank" rel="noopener noreferrer">
              <IconWa /> Получить консультацию
            </a>
          </div>
        </div>

        <div className="hero__right">
          <div className="hero__right-card">
            <h4>Категории продукции</h4>
            <ul>
              <li>Скамьи и лавки</li>
              <li>Перголы и навесы</li>
              <li>Малые архитектурные формы</li>
              <li>Спортивное оборудование</li>
              <li>Парковое освещение</li>
              <li>Урны и аксессуары</li>
            </ul>
          </div>
          <div className="hero__right-stat">
            <div className="hero__right-stat-item">
              <strong>70+</strong>
              <span>позиций</span>
            </div>
            <div className="hero__right-stat-item">
              <strong>6</strong>
              <span>категорий</span>
            </div>
            <div className="hero__right-stat-item">
              <strong>КМФ</strong>
              <span>сертификат</span>
            </div>
            <div className="hero__right-stat-item">
              <strong>Алматы</strong>
              <span>производство</span>
            </div>
          </div>
        </div>
      </div>
      <a href="#catalog" className="hero__scroll" aria-label="Прокрутить вниз">
        <span>Прокрутить</span>
        <svg width="14" height="22" viewBox="0 0 14 22" fill="none" aria-hidden="true">
          <path d="M7 0v18M1 12l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </a>
    </section>
  )
}

// ═══════════════════════════════════════════════════════
//  PRODUCT CARD
// ═══════════════════════════════════════════════════════
function ProductCard({ product }) {
  const [imgOk, setImgOk] = useState(true)

  return (
    <article className="card">
      <div className="card__media">
        {imgOk ? (
          <img
            src={`/images/${product.id}.jpeg`}
            alt={product.name}
            loading="lazy"
            onError={() => setImgOk(false)}
          />
        ) : (
          <div className="card__no-img">
            <span>{product.id}</span>
          </div>
        )}
        <span className="card__cat">{product.category}</span>
      </div>
      <div className="card__body">
        <p className="card__art">{product.id}</p>
        <h3 className="card__name">{product.name}</h3>
        <p className="card__price">{fmt(product.price)}</p>
        <a
          href={waUrl(product)}
          className="card__wa"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Узнать подробнее о ${product.name}`}
        >
          <IconWa />
          Узнать подробнее
        </a>
      </div>
    </article>
  )
}

// ═══════════════════════════════════════════════════════
//  CATALOG SECTION
// ═══════════════════════════════════════════════════════
function CatalogSection({ products }) {
  const [category, setCategory] = useState('Все')
  const [priceIdx, setPriceIdx]   = useState(0)
  const [sort, setSort]           = useState('default')
  const [search, setSearch]       = useState('')

  // Категории строятся динамически из CSV
  const categories = useMemo(() => {
    const seen = new Set()
    const list = [{ key: 'Все' }]
    products.forEach(p => { if (p.category && !seen.has(p.category)) { seen.add(p.category); list.push({ key: p.category }) } })
    return list
  }, [products])

  const filtered = useMemo(() => {
    const range = PRICE_RANGES[priceIdx]
    let list = products.filter(p => {
      const catOk   = category === 'Все' || p.category === category
      const priceOk = p.price >= range.min && p.price <= range.max
      const q       = search.toLowerCase()
      const srchOk  = !q || p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)
      return catOk && priceOk && srchOk
    })
    if (sort === 'asc')  list = [...list].sort((a, b) => a.price - b.price)
    if (sort === 'desc') list = [...list].sort((a, b) => b.price - a.price)
    return list
  }, [products, category, priceIdx, sort, search])

  return (
    <section className="catalog" id="catalog">
      <div className="container">

        {/* Section header */}
        <div className="catalog__head">
          <h2 className="catalog__title">Каталог продукции</h2>
          <p className="catalog__sub">Вся продукция изготавливается под заказ с учётом требований объекта</p>
        </div>

        {/* Filters */}
        <div className="filters">
          {/* Category tabs */}
          <div className="filters__cats" role="group" aria-label="Категории">
            {categories.map(c => (
              <button
                key={c.key}
                className={`fcat${category === c.key ? ' fcat--on' : ''}`}
                onClick={() => setCategory(c.key)}
              >
                {c.key}
              </button>
            ))}
          </div>

          {/* Second row: price + search + sort */}
          <div className="filters__row">
            <div className="filters__prices" role="group" aria-label="Ценовой диапазон">
              {PRICE_RANGES.map((r, i) => (
                <button
                  key={i}
                  className={`fprice${priceIdx === i ? ' fprice--on' : ''}`}
                  onClick={() => setPriceIdx(i)}
                >
                  {r.label}
                </button>
              ))}
            </div>

            <div className="filters__controls">
              <label className="search-wrap" aria-label="Поиск по каталогу">
                <IconSearch />
                <input
                  type="search"
                  placeholder="Поиск..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </label>

              <div className="sort-wrap">
                <select
                  className="sort-sel"
                  value={sort}
                  onChange={e => setSort(e.target.value)}
                  aria-label="Сортировка"
                >
                  <option value="default">По умолчанию</option>
                  <option value="asc">Цена ↑</option>
                  <option value="desc">Цена ↓</option>
                </select>
                <IconChevron />
              </div>
            </div>
          </div>
        </div>

        {/* Count */}
        <p className="catalog__count">
          Показано <strong>{filtered.length}</strong> из {products.length} товаров
        </p>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid">
            {filtered.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div className="catalog__empty">
            <p>Ничего не найдено — попробуйте изменить фильтры</p>
            <button onClick={() => { setCategory('Все'); setPriceIdx(0); setSearch('') }}>
              Сбросить фильтры
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════
//  ABOUT SECTION
// ═══════════════════════════════════════════════════════
function About() {
  const points = [
    { title: 'Производство под заказ', text: 'Каждое изделие изготавливается с учётом конкретного объекта, размеров и требований' },
    { title: 'Металл и дерево',         text: 'Конструкционная сталь с порошковым покрытием, термообработанная древесина' },
    { title: 'Под проекты любого масштаба', text: 'Парки, дворы ЖК, кампусы, коммерческие территории — опыт работы со всеми форматами' },
    { title: 'Гарантия и монтаж',       text: 'Полный цикл: от замеров до установки. Гарантия на все изделия' },
  ]

  return (
    <section className="about" id="about">
      <div className="container about__inner">
        <div className="about__text">
          <p className="about__label">О компании</p>
          <h2 className="about__title">Создаём пространства,<br /><em>где хочется остаться</em></h2>
          <p className="about__desc">
            vkvadrate — алматинский производитель уличного оборудования и малых архитектурных форм.
            Работаем с девелоперами, муниципалитетами и управляющими компаниями по всему Казахстану.
          </p>
          <a href={waGeneral} className="about__cta btn-wa" target="_blank" rel="noopener noreferrer">
            <IconWa /> Обсудить проект
          </a>
        </div>
        <div className="about__grid">
          {points.map((p, i) => (
            <div key={i} className="about__card">
              <span className="about__num">0{i + 1}</span>
              <h4>{p.title}</h4>
              <p>{p.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════
//  FOOTER
// ═══════════════════════════════════════════════════════
function Footer() {
  const cats = ['Скамьи', 'Перголы', 'МАФ', 'Освещение', 'Спортивное оборудование', 'Урны']
  return (
    <footer className="footer" id="contact">
      <div className="container footer__inner">
        <div className="footer__brand">
          <img src="/logo.png" alt="vkvadrate" width="56" height="56" />
          <p>Благоустройство городских<br />пространств</p>
          <span className="footer__city">Алматы, Казахстан</span>
        </div>

        <div className="footer__nav">
          <h4>Категории</h4>
          <ul>
            {cats.map(c => (
              <li key={c}><a href="#catalog">{c}</a></li>
            ))}
          </ul>
        </div>

        <div className="footer__contact">
          <h4>Написать нам</h4>
          <p>Ответим на все вопросы,<br />составим смету под объект</p>
          <a href={waGeneral} className="footer__wa btn-wa" target="_blank" rel="noopener noreferrer">
            <IconWa /> WhatsApp
          </a>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <span>© {new Date().getFullYear()} vkvadrate almaty</span>
          <span>Вся продукция изготавливается на заказ</span>
        </div>
      </div>
    </footer>
  )
}

// ═══════════════════════════════════════════════════════
//  APP ROOT
// ═══════════════════════════════════════════════════════
export default function App() {
  const [scrolled, setScrolled] = useState(false)
  const { products, loading, error } = useProducts()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 72)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="app">
      <Header scrolled={scrolled} />
      <Hero />
      {loading && (
        <div className="csv-state">Загружаем каталог…</div>
      )}
      {error && (
        <div className="csv-state csv-state--err">
          Не удалось загрузить каталог: {error}<br />
          Убедитесь что файл <code>public/data.csv</code> существует.
        </div>
      )}
      {!loading && !error && <CatalogSection products={products} />}
      <About />
      <Footer />
    </div>
  )
}
