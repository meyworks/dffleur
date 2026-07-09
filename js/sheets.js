const DF_SHEET_PUBHTML = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRTB4bIAWk0Bfn3sf8bkSZJMykqjJ0B_lu_d_0Ys0t3ZUCmkRVH4bSkHOTRbu_938q5lgAmF4EqKDSa/pubhtml';
const FALLBACK = {
  Offers:[
    {ID:'NEWS-001',Title:'Grand Opening',Description:'Our grand opening was announced for April 12th. Visit DF Fleur for a premium café & restaurant experience.',Type:'News',ImageUrl:'',StartDate:'2026-04-12',EndDate:'',Status:'Active'},
    {ID:'NEWS-002',Title:'Something Brewing',Description:'DF Fleur introduces a new spot with good vibes, coffee, food, and a refined dining mood.',Type:'News',ImageUrl:'',StartDate:'',EndDate:'',Status:'Active'},
    {ID:'OFFER-001',Title:'Coffee Mood',Description:'Every cup tells a story. Enjoy the DF Fleur coffee atmosphere with premium hot and cold beverages.',Type:'Offer',ImageUrl:'',StartDate:'',EndDate:'',Status:'Active'}
  ],
  MenuCategories:[{Categories:'Beverages'},{Categories:'Breakfast'},{Categories:'Cold Drinks'},{Categories:'Desserts'},{Categories:'Hot Drinks'},{Categories:'Main Courses'},{Categories:'Offers'},{Categories:'Oriental'},{Categories:'Pasta'},{Categories:'Salads'},{Categories:'Sandwiches'},{Categories:'Soups'}],
  MenuItems:[
    {ID:'MENU-001',Category:'Soups',Name:'Cream of Chicken Soup',Description:'Creamy chicken soup served with a toasted bread slice.',Price:'100',ImageUrl:'',Status:'Available'},
    {ID:'MENU-002',Category:'Salads',Name:'Greek Salad',Description:'Fresh lettuce, feta cheese, olives, onion, tomato, and herbs.',Price:'150',ImageUrl:'',Status:'Available'},
    {ID:'MENU-003',Category:'Main Courses',Name:'Sizzling Beef',Description:'A sizzling beef platter served with vegetables and fries.',Price:'200',ImageUrl:'',Status:'Available'},
    {ID:'MENU-004',Category:'Sandwiches',Name:'Chicken Burger',Description:'Crispy chicken burger served with fries.',Price:'250',ImageUrl:'',Status:'Available'},
    {ID:'MENU-005',Category:'Pasta',Name:'Creamy Alfredo Pasta',Description:'Oven-baked creamy Alfredo pasta.',Price:'',ImageUrl:'',Status:'Available'},
    {ID:'MENU-006',Category:'Pasta',Name:'Pasta Béchamel',Description:'Classic baked pasta with béchamel sauce.',Price:'',ImageUrl:'',Status:'Available'},
    {ID:'MENU-007',Category:'Oriental',Name:'Oriental Casseroles',Description:'Baked oriental casserole served hot in clay pot style.',Price:'',ImageUrl:'',Status:'Available'},
    {ID:'MENU-008',Category:'Oriental',Name:'Stuffed Grape Leaves',Description:'Stuffed grape leaves with a rich house-style sauce.',Price:'',ImageUrl:'',Status:'Available'},
    {ID:'MENU-009',Category:'Beverages',Name:'Sophisticated Coffee Mood',Description:'Premium coffee beverage served in DF Fleur style.',Price:'',ImageUrl:'',Status:'Available'},
    {ID:'MENU-010',Category:'Beverages',Name:'Oreo Crunch Milkshake',Description:'Creamy Oreo milkshake topped with whipped cream and cookies.',Price:'',ImageUrl:'',Status:'Available'},
    {ID:'MENU-011',Category:'Beverages',Name:'Chocolate Frappe',Description:'Luxury chocolate drink served with whipped cream.',Price:'',ImageUrl:'',Status:'Available'}
  ],
  Contact:[{ID:'CONTACT-001',Name:'DF Fleur Restaurant & Café',WhatsApp:'201040009755',Phone:'01040009755',Address:'24 Mohamed Farid Street, El Nozha / Heliopolis, Cairo',OpeningHours:'Daily 9:30 AM to 2:00 AM',MapUrl:'https://maps.app.goo.gl/7VynE7MCGKN9WkDS9',FacebookUrl:'https://www.facebook.com/Df.FLEUR.Cafe/',InstagramUrl:'https://www.instagram.com/df.fleur.cafe/'}]
};
function gvizUrl(sheet){return DF_SHEET_PUBHTML.replace('/pubhtml','/gviz/tq?tqx=out:json&sheet='+encodeURIComponent(sheet));}
function cellValue(c){if(!c)return ''; return c.f ?? c.v ?? '';}
function tableToObjects(table){const cols=(table.cols||[]).map(c=>String(c.label||'').trim());return (table.rows||[]).map(r=>{let o={};(r.c||[]).forEach((c,i)=>{if(cols[i]) o[cols[i]]=cellValue(c)});return o}).filter(o=>Object.values(o).some(v=>String(v).trim()!==''));}
async function loadSheet(sheet){try{const res=await fetch(gvizUrl(sheet)); if(!res.ok) throw new Error('Sheet fetch failed'); const text=await res.text(); const json=JSON.parse(text.substring(text.indexOf('{'), text.lastIndexOf('}')+1)); const rows=tableToObjects(json.table); return rows.length?rows:(FALLBACK[sheet]||[]);}catch(e){console.warn('Using fallback for',sheet,e); return FALLBACK[sheet]||[];}}
function activeRows(rows){return rows.filter(r=>!r.Status || ['active','available','yes'].includes(String(r.Status).trim().toLowerCase()));}
function money(v){return v?`${v} EGP`:''}
function setupNav(){const btn=document.querySelector('.menuBtn'),links=document.querySelector('.links'); if(btn&&links) btn.onclick=()=>links.classList.toggle('open');}
document.addEventListener('DOMContentLoaded',setupNav);
