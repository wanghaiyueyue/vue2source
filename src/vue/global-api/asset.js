const ASSETS_TYPE = ['component', 'directive', 'filter']
export default function initAssetRegisters(Vue){
  ASSETS_TYPE.forEach(type => {
    Vue[type] = function(id,definition){
      if(type === 'component'){
        // 这里返回的就是Sub构造器
        definition = this.options._base.extend(definition)
      }
      // definition 是sub构造器
      this.options[type + 's'][id] = definition
    }
  })
}