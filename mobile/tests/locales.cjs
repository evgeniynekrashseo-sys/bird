const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ctx={window:{}};
vm.createContext(ctx);
for(const path of ['www/locales.js','www/locales-market.js'])vm.runInContext(fs.readFileSync(path,'utf8'),ctx,{filename:path});
const {FluffyLocales,FluffyLocaleNames,FluffyVoiceTags}=ctx.window;
assert.equal(Object.keys(FluffyLocales).length,18);
const base=FluffyLocales.en;
for(const [locale,pack] of Object.entries(FluffyLocales)){
  for(const key of Object.keys(base)){
    if(key==='names'||key==='chapters'){
      assert.equal(pack[key].length,base[key].length,locale+' '+key);
      assert(pack[key].every(v=>typeof v==='string'&&v.length>0),locale+' '+key);
    }else if(key==='modes'||key==='modeDetails'){
      assert(Object.keys(base[key]).every(k=>typeof pack[key][k]==='string'&&pack[key][k].length>0),locale+' '+key);
    }else assert(typeof pack[key]==='string'&&pack[key].length>0,locale+' '+key);
  }
  assert(pack.hintMove.includes('{a}')&&pack.hintMove.includes('{b}'),locale+' hint placeholders');
  assert(pack.victorySummary.includes('{level}')&&pack.victorySummary.includes('{moves}'),locale+' victory placeholders');
  assert(FluffyLocaleNames[locale]&&FluffyVoiceTags[locale],locale+' locale identity');
}
console.log('PASS: '+Object.keys(FluffyLocales).length+' full UI translation packs and matching voice tags');
const aso=JSON.parse(fs.readFileSync('store/aso-locales.json','utf8'));
assert.equal(Object.keys(aso).length,18);
for(const [locale,copy] of Object.entries(aso)){
  assert([...copy.title].length<=30,locale+' title exceeds Google Play limit');
  assert([...copy.short].length<=80,locale+' short description exceeds Google Play limit');
  assert([...copy.keywords].length<=100,locale+' iOS keywords exceed 100 characters');
}
console.log('PASS: 18 ASO titles, short descriptions and keyword fields');
