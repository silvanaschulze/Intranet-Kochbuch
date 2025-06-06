# 📚 Documentação JSDoc - Intranet Kochbuch

Este projeto utiliza **JSDoc** para gerar documentação automática do código JavaScript/React.

## 🚀 Como gerar a documentação

Execute o comando que o professor mencionou:

```bash
npm run docs
```

Ou o comando completo:

```bash
jsdoc -c jsdoc.json
```

A documentação será gerada na pasta `docs/` e você pode abrir o arquivo `docs/index.html` no navegador.

## 📝 Como documentar seus componentes React

### Exemplo básico para um componente:

```javascript
/**
 * @fileoverview Descrição do arquivo
 * @component NomeDoComponente
 */

/**
 * Componente para exibir informações do usuário
 * 
 * @param {Object} props - Propriedades do componente
 * @param {string} props.nome - Nome do usuário
 * @param {string} props.email - Email do usuário
 * @param {boolean} [props.ativo=true] - Se o usuário está ativo (opcional)
 * @param {Function} props.onEdit - Callback para editar usuário
 * @returns {JSX.Element} Componente renderizado
 * 
 * @example
 * <UserCard 
 *   nome="Ana Silva" 
 *   email="ana@exemplo.com"
 *   ativo={true}
 *   onEdit={(id) => console.log('Editar:', id)}
 * />
 */
const UserCard = ({ nome, email, ativo = true, onEdit }) => {
  // código do componente...
}
```

### Tags JSDoc mais usadas:

- `@param {type} name - description` - Parâmetros da função
- `@returns {type} description` - O que a função retorna
- `@example` - Exemplo de uso
- `@component` - Marca como componente React
- `@fileoverview` - Descrição do arquivo
- `@author` - Autor do código
- `@since` - Versão desde quando existe
- `@deprecated` - Marca como obsoleto

### Documentando funções utilitárias:

```javascript
/**
 * Formata uma data para o padrão brasileiro
 * @param {string|Date} data - Data para formatar
 * @param {boolean} [incluirHora=false] - Se deve incluir hora
 * @returns {string} Data formatada (DD/MM/YYYY)
 * 
 * @example
 * formatarData('2024-01-15') // "15/01/2024"
 * formatarData(new Date(), true) // "15/01/2024 14:30"
 */
function formatarData(data, incluirHora = false) {
  // implementação...
}
```

### Documentando APIs/Services:

```javascript
/**
 * @fileoverview Serviços para comunicação com API de receitas
 */

/**
 * Busca todas as receitas do usuário
 * @async
 * @param {number} usuarioId - ID do usuário
 * @param {Object} [filtros] - Filtros opcionais
 * @param {string} [filtros.categoria] - Filtrar por categoria
 * @param {string} [filtros.busca] - Termo de busca
 * @returns {Promise<Array<Object>>} Lista de receitas
 * @throws {Error} Erro de comunicação com API
 */
async function buscarReceitas(usuarioId, filtros = {}) {
  // implementação...
}
```

## 🎯 Dicas importantes:

1. **Sempre documente**:
   - Componentes React principais
   - Funções utilitárias
   - Serviços de API
   - Hooks customizados

2. **Use tipos TypeScript-style**:
   - `{string}` - texto
   - `{number}` - número
   - `{boolean}` - verdadeiro/falso
   - `{Array<string>}` - array de strings
   - `{Object}` - objeto
   - `{Function}` - função
   - `{JSX.Element}` - componente React

3. **Parâmetros opcionais**: Use `[nomeParam]` ou `[nomeParam=valorPadrao]`

4. **Sempre inclua exemplos** com `@example` para facilitar o uso

## 📁 Estrutura da documentação gerada:

```
docs/
├── index.html          # Página principal
├── global.html         # Funções globais
├── components/         # Componentes documentados
├── services/          # Serviços documentados
└── styles/            # CSS da documentação
```

Abra `docs/index.html` no navegador para ver sua documentação!

## 💡 Exemplo prático com seu projeto:

Seu componente `RecipeCard.jsx` já está bem documentado! Veja um exemplo:

```javascript
/**
 * RecipeCard Komponente
 * Zeigt eine Vorschau eines Rezepts in Kartenform an
 * 
 * @param {Object} props.recipe - Das anzuzeigende Rezept
 * @param {string|number} props.recipe.id - ID des Rezepts
 * @param {string} props.recipe.titel - Título da receita
 * @param {boolean} [props.isFavorite] - Se é favorito
 * @returns {JSX.Element} Componente RecipeCard renderizado
 */
```

Agora execute `npm run docs` e veja a magia acontecer! 🎉 