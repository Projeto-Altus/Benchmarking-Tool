/**
 * Exporta URLs e atributos para arquivo JSON
 */
export const exportConfig = (urls, attributes) => {
  const config = {
    urls,
    attributes
  };

  const dataStr = JSON.stringify(config, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  
  const timestamp = new Date().toISOString().split('T')[0];
  link.href = url;
  link.download = `benchmark-config-${timestamp}.json`;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Importa arquivo JSON e retorna { urls, attributes }
 */
export const importConfig = () => {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) {
        reject(new Error('Nenhum arquivo selecionado'));
        return;
      }

      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const config = JSON.parse(event.target.result);
          
          // Validar estrutura
          if (!Array.isArray(config.urls) || !Array.isArray(config.attributes)) {
            reject(new Error('Formato de arquivo inválido. Esperado: { urls: [], attributes: [] }'));
            return;
          }

          // Validar atributos
          const validAttributes = config.attributes.every(
            attr => attr.name && typeof attr.importance === 'number'
          );
          if (!validAttributes) {
            reject(new Error('Atributos com formato inválido'));
            return;
          }

          resolve(config);
        } catch (error) {
          reject(new Error(`Erro ao parsear JSON: ${error.message}`));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Erro ao ler arquivo'));
      };
      
      reader.readAsText(file);
    };
    
    input.click();
  });
};
