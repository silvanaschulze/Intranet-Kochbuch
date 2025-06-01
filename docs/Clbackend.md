Planejamento Detalhado - Intranet-Kochbuch der Auszubildenden

Status Atual do Projeto

	Configuração do ambiente de desenvolvimento (VM, Python, pip, venv)
	Instalação das bibliotecas 
	Configuração do banco de dados MySQL
	Estrutura básica do Flask
	Reorganização da estrutura de arquivos (models, routes, utils, static)
	Implementação básica do registro de usuário
	Função de hash de senha

	Autenticação completa com JWT
	CRUD de receitas
	Login de usuário (função implementada, mas precisa ser testada)

	CRUD completo de receitas
	Upload de imagens
	Busca e filtros
	Funcionalidades opcionais (categorias, comentários, favoritos)
	Testes e documentação


Planejamento Detalhado para Conclusão do Backend
Fase 1: Autenticação Completa (Prioridade Alta)
1.1 Implementar Login de Usuário
	Criar função benutzer_anmelden(email, passwort) em models/user.py
	Implementar verificação de senha com bcrypt
	Adicionar rota de login em routes/benutzer_routes.py
	 Testar login com Postman ou curl
1.2 Implementar Autenticação JWT
	Instalar biblioteca PyJWT: pip install pyjwt
	Atualizar requirements.txt: pip freeze > requirements.txt
	Criar arquivo utils/token.py com funções:
	token_generieren(benutzer_id, email)
	token_verifizieren(token)
	 Retornar token JWT na resposta de login
	 Testar geração e validação de token
1.3 Implementar Middleware de Autenticação
	Criar função decoradora token_erforderlich em utils/token.py
	 Aplicar decorador nas rotas protegidas
	 Testar acesso a rotas protegidas com e sem token. Resultado: Você concluiu com sucesso a Fase 1 (Autenticação Completa) do seu checklist. O token JWT está funcionando corretamente e a rota protegida está retornando os dados do usuário conforme esperado.
Fase 2: CRUD de Receitas (Prioridade Alta)
2.1 Criar Modelo de Receita
	 Criar arquivo models/rezept.py
	 Implementar funções:
o	 rezept_erstellen(titel, zutaten, zubereitung, bild_pfad, benutzer_id)
o	 rezept_abrufen(rezept_id)
o	 rezepte_auflisten(limit=10, offset=0)
o	 rezept_aktualisieren(rezept_id, titel, zutaten, zubereitung, bild_pfad)
o	 rezept_loeschen(rezept_id, benutzer_id)
2.2 Criar Rotas para Receitas
	 Criar arquivo routes/rezept_routes.py
	 Implementar rotas:
o	 GET /api/rezepte (listar todas)
o	 GET /api/rezepte/<id> (detalhes)
o	 POST /api/rezepte (criar)
o	 PUT /api/rezepte/<id> (editar)
o	 DELETE /api/rezepte/<id> (excluir)
	 Registrar blueprint no app.py
2.3 Implementar Upload de Imagens
	 Criar função para salvar imagens em static/uploads
	 Implementar validação de tipo de arquivo (apenas imagens)
	 Gerar nomes de arquivo únicos para evitar conflitos
	 Testar upload de imagens com Postman
Fase 3: Funcionalidades Adicionais (Prioridade Média)
3.1 Implementar Sistema de Busca e Filtros
	Adicionar função rezepte_suchen(suchbegriff) em models/rezept.py
	Criar rota GET /api/rezepte/suche em routes/rezept_routes.py
	Implementar filtros por categoria (se implementar categorias)
	Testar busca com diferentes termos
3.2 Implementar Paginação
	Modificar função rezepte_auflisten para suportar paginação
	Adicionar parâmetros de consulta para página e tamanho
	Retornar metadados de paginação (total, páginas, etc.)
	Testar paginação com diferentes parâmetros
Fase 4: Funcionalidades Opcionais (Prioridade Baixa)
4.1 Implementar Categorias
•	 Criar modelo models/kategorie.py
•	 Implementar funções CRUD para categorias
•	 Criar rotas para gerenciar categorias
•	 Adicionar relação entre receitas e categorias
4.2 Implementar Comentários
•	 Criar modelo models/kommentar.py
•	 Implementar funções CRUD para comentários
•	 Criar rotas para gerenciar comentários
•	 Testar adição e listagem de comentários
4.3 Implementar Favoritos
•	 Criar modelo para favoritos
•	 Implementar funções para adicionar/remover favoritos
•	 Criar rotas para gerenciar favoritos
•	 Implementar listagem de receitas favoritas por usuário
Fase 5: Segurança e Otimização (Prioridade Alta)
5.1 Implementar Validação de Dados
	Criar validadores para email e senha
	Adicionar validação para todos os dados de entrada
	Implementar tratamento de erros consistente
	Retornar mensagens de erro claras e úteis
5.2 Implementar Rate Limiting
	Instalar Flask-Limiter: pip install flask-limiter
	Configurar limites de taxa para rotas sensíveis (login, registro)
	Testar limites de taxa
5.3 Otimizar Consultas ao Banco de Dados
	Revisar todas as consultas SQL
	Adicionar índices apropriados nas tabelas
	Implementar cache para consultas frequentes (opcional)
Fase 6: Testes e Documentação (Prioridade Média)
6.1 Implementar Testes
	Criar testes para funções críticas
	Testar fluxos completos (registro, login, CRUD)
	Documentar procedimentos de teste
6.2 Documentar API
	Documentar todas as rotas e parâmetros
	Criar exemplos de uso para cada rota
	Adicionar docstrings a todas as funções
6.3 Preparar para Integração com Frontend
	Verificar CORS para todas as rotas
	Garantir formato de resposta consistente
	Testar integração com chamadas de API simuladas
Critérios para Conclusão do Backend
O backend será considerado concluído quando:
1.	Todas as funcionalidades de Prioridade Alta estiverem implementadas e testadas
2.	A API estiver documentada
3.	O sistema de autenticação estiver funcionando corretamente
4.	O CRUD de receitas estiver completo, incluindo upload de imagens
5.	Os testes básicos estiverem passando
Próximos Passos após Conclusão do Backend
1.	Configurar projeto React para o frontend
2.	Implementar componentes de UI para todas as funcionalidades do backend
3.	Integrar frontend com backend
4.	Testar aplicação completa
5.	Preparar para deployment


