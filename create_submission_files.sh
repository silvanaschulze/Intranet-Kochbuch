#!/bin/bash

# Script para criar arquivos de submissão do projeto Intranet-Kochbuch
# Autor: Silvana Schulze
# Data: $(date +%Y-%m-%d)

echo "🚀 Iniciando criação dos arquivos de submissão..."
echo "========================================"

# Definir variáveis
SOBRENOME="schulze"
PROJETO_DIR="."
DB_NAME="fi37_${SOBRENOME}_fpadw"
DB_USER="kochbuch"  # Altere se necessário
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📁 Criando arquivo da aplicação completa...${NC}"

# 1. Criar arquivo TAR da aplicação completa
if [ -d "$PROJETO_DIR" ]; then
    echo -e "${YELLOW}   Compactando aplicação (excluindo venv, node_modules, __pycache__)...${NC}"
    
    tar --exclude="$PROJETO_DIR/backend/venv" \
        --exclude="$PROJETO_DIR/node_modules" \
        --exclude="$PROJETO_DIR/backend/__pycache__" \
        --exclude="$PROJETO_DIR/**/__pycache__" \
        --exclude="$PROJETO_DIR/.git" \
        --exclude="$PROJETO_DIR/**/*.pyc" \
        --exclude="$PROJETO_DIR/**/*.log" \
        -czf "${SOBRENOME}_final.tar.gz" "$PROJETO_DIR/"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}   ✅ Arquivo ${SOBRENOME}_final.tar.gz criado com sucesso!${NC}"
        echo -e "${BLUE}   📊 Tamanho: $(du -h ${SOBRENOME}_final.tar.gz | cut -f1)${NC}"
    else
        echo -e "${RED}   ❌ Erro ao criar arquivo da aplicação${NC}"
    fi
else
    echo -e "${RED}   ❌ Diretório $PROJETO_DIR não encontrado${NC}"
fi

echo ""
echo -e "${BLUE}🗄️ Criando dump da base de dados...${NC}"

# 2. Criar dump da base de dados
echo -e "${YELLOW}   Fazendo dump da base de dados $DB_NAME...${NC}"
echo -e "${YELLOW}   (Será solicitada a senha do MySQL)${NC}"

mysqldump -u "$DB_USER" -p "$DB_NAME" > "${SOBRENOME}_dbdump.sql"

if [ $? -eq 0 ] && [ -s "${SOBRENOME}_dbdump.sql" ]; then
    echo -e "${GREEN}   ✅ Dump da base de dados criado com sucesso!${NC}"
    echo -e "${BLUE}   📊 Tamanho: $(du -h ${SOBRENOME}_dbdump.sql | cut -f1)${NC}"
    
    # Comprimir o dump
    echo -e "${YELLOW}   Comprimindo dump da base de dados...${NC}"
    tar -czf "${SOBRENOME}_dbdump.tar.gz" "${SOBRENOME}_dbdump.sql"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}   ✅ Arquivo ${SOBRENOME}_dbdump.tar.gz criado com sucesso!${NC}"
        echo -e "${BLUE}   📊 Tamanho comprimido: $(du -h ${SOBRENOME}_dbdump.tar.gz | cut -f1)${NC}"
    else
        echo -e "${RED}   ❌ Erro ao comprimir dump da base de dados${NC}"
    fi
else
    echo -e "${RED}   ❌ Erro ao criar dump da base de dados${NC}"
    echo -e "${YELLOW}   💡 Verifique se:${NC}"
    echo -e "${YELLOW}      - O MySQL está funcionando${NC}"
    echo -e "${YELLOW}      - A base de dados $DB_NAME existe${NC}"
    echo -e "${YELLOW}      - As credenciais estão corretas${NC}"
fi

echo ""
echo "========================================"
echo -e "${GREEN}🎯 RESUMO DOS ARQUIVOS CRIADOS:${NC}"
echo "========================================"

# Listar arquivos criados
for arquivo in "${SOBRENOME}_final.tar.gz" "${SOBRENOME}_dbdump.sql" "${SOBRENOME}_dbdump.tar.gz"; do
    if [ -f "$arquivo" ]; then
        echo -e "${GREEN}✅ $arquivo ($(du -h $arquivo | cut -f1))${NC}"
    else
        echo -e "${RED}❌ $arquivo (não criado)${NC}"
    fi
done

echo ""
echo -e "${BLUE}📝 INSTRUÇÕES FINAIS:${NC}"
echo "1. Envie o arquivo ${SOBRENOME}_final.tar.gz (aplicação completa)"
echo "2. Envie o arquivo ${SOBRENOME}_dbdump.tar.gz (dump da base de dados)"
echo ""
echo -e "${YELLOW}💡 DICA: Para extrair os arquivos:${NC}"
echo "   tar -xzf ${SOBRENOME}_final.tar.gz"
echo "   tar -xzf ${SOBRENOME}_dbdump.tar.gz"
echo ""
echo -e "${GREEN}✨ Concluído!${NC}" 