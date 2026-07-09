const DF_SHEET_PUBHTML = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRTB4bIAWk0Bfn3sf8bkSZJMykqjJ0B_lu_d_0Ys0t3ZUCmkRVH4bSkHOTRbu_938q5lgAmF4EqKDSa/pubhtml';

const FALLBACK = {
  Offers: [
    {ID:'NEWS-001',Title:'Grand Opening',Description:'Our grand opening was announced for April 12th. Visit DF FLEUR for a premium café & restaurant experience.',Type:'News',ImageUrl:'',StartDate:'2026-04-12',EndDate:'',Status:'Active'},
    {ID:'NEWS-002',Title:'Something Brewing',Description:'DF FLEUR introduces a new spot with good vibes, coffee, food, and a refined dining mood.',Type:'News',ImageUrl:'',StartDate:'',EndDate:'',Status:'Active'},
    {ID:'OFFER-001',Title:'A New Dining Experience',Description:'A premium restaurant and café destination in Heliopolis with elegant food, coffee, and a calm luxury atmosphere.',Type:'Offer',ImageUrl:'',StartDate:'',EndDate:'',Status:'Active'}
  ],
  MenuCategories: [
    {ID:'1',Categories:'Soups'}, {ID:'2',Categories:'Salads'}, {ID:'3',Categories:'Main Courses'},
    {ID:'4',Categories:'Sandwiches'}, {ID:'5',Categories:'Pasta'}, {ID:'6',Categories:'Oriental'},
    {ID:'7',Categories:'Beverages'}, {ID:'8',Categories:'Desserts'}
  ],
  MenuItems: [
    {ID:'M001',Category:'Soups',Name:'Cream of Chicken Soup',Description:'Creamy chicken soup served with toasted bread.',Price:'100',ImageUrl:'',Status:'Available'},
    {ID:'M002',Category:'Salads',Name:'Greek Salad',Description:'Fresh lettuce, feta cheese, olives, tomato, and herbs.',Price:'150',ImageUrl:'',Status:'Available'},
    {ID:'M003',Category:'Main Courses',Name:'Sizzling Beef',Description:'Hot sizzling beef platter served with vegetables and fries.',Price:'200',ImageUrl:'',Status:'Available'},
    {ID:'M004',Category:'Sandwiches',Name:'Chicken Burger',Description:'Crispy chicken burger served with fries.',Price:'250',ImageUrl:'',Status:'Available'},
    {ID:'M005',Category:'Beverages',Name:'Signature Coffee',Description:'Premium coffee served in DF FLEUR style.',Price:'',ImageUrl:'',Status:'Available'}
  ],
  Contact: [
    {ID:'CONTACT-001',Name:'DF Fleur Restaurant & Café',WhatsApp:'201040009755',Phone:'01040009755',Address:'24 Mohamed Farid Street, El Nozha / Heliopolis, Cairo',OpeningHours:'Daily 9:30 AM to 2:00 AM',MapUrl:'https://maps.app.goo.gl/7VynE7MCGKN9WkDS9',FacebookUrl:'https://www.facebook.com/Df.FLEUR.Cafe/',InstagramUrl:'https://www.instagram.com/df.fleur.cafe/'}
  ]
};

function gvizUrl(sheetName) {
  return DF_SHEET_PUBHTML.replace('/pubhtml', '/gviz/tq?tqx=out:json&sheet=' + encodeURIComponent(sheetName));
}

function cellValue(cell) {
  if (!cell) return '';
  return cell.f ?? cell.v ?? '';
}

function tableToObjects(table) {
  const headers = (table.cols || []).map(col => String(col.label || '').trim());
  return (table.rows || [])
    .map(row => {
      const obj = {};
      (row.c || []).forEach((cell, index) => {
        if (headers[index]) obj[headers[index]] = cellValue(cell);
      });
      return obj;
    })
    .filter(obj => Object.values(obj).some(value => String(value).trim() !== ''));
}

async function loadSheet(sheetName) {
  try {
    const response = await fetch(gvizUrl(sheetName), { cache: 'no-store' });
    if (!response.ok) throw new Error('Data request failed');
    const text = await response.text();
    const jsonText = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
    const json = JSON.parse(jsonText);
    const rows = tableToObjects(json.table);
    return rows.length ? rows : (FALLBACK[sheetName] || []);
  } catch (error) {
    console.warn('Fallback data used for', sheetName, error);
    return FALLBACK[sheetName] || [];
  }
}

function activeRows(rows) {
  return rows.filter(row => {
    const status = String(row.Status || '').trim().toLowerCase();
    return !status || ['active', 'available', 'yes', 'true', '1'].includes(status);
  });
}

function formatPrice(value) {
  const clean = String(value || '').trim();
  if (!clean) return '';
  return clean.toLowerCase().includes('egp') ? clean : clean + ' EGP';
}

function safeText(value) {
  return String(value || '').replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
}

function normalizeWhatsApp(value) {
  return String(value || '').replace(/[^0-9]/g, '').replace(/^0/, '20');
}

function setupNavigation() {
  const button = document.querySelector('.nav-toggle');
  const menu = document.querySelector('.nav-links');
  if (button && menu) button.addEventListener('click', () => menu.classList.toggle('is-open'));
}

document.addEventListener('DOMContentLoaded', setupNavigation);
