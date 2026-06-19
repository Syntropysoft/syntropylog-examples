#!/bin/bash

# ==============================================================================
# SyntropyLog - Update Examples to Local Version
#
# This script updates all examples to use the local compiled version
# instead of the npm version for development and testing purposes.
# ==============================================================================

# --- Colors and Formatting ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# --- Configuration ---
# Ruta a la librería local (relativa al package.json de cada ejemplo).
# Estructura esperada: .../syntropy/syntropylog-examples/  y  .../syntropy/syntropyLog/
LOCAL_VERSION="file:../../syntropyLog"
PACKAGE_NAME="syntropylog"

echo -e "${YELLOW}🔄 Actualizando ejemplos para usar versión local...${NC}"
echo -e "${BLUE}Versión local: ${LOCAL_VERSION}${NC}"
echo

# Get all example directories
examples=($(ls -d [0-9][0-9]-*/ 2>/dev/null | sort))

if [ ${#examples[@]} -eq 0 ]; then
    echo -e "${RED}❌ No se encontraron directorios de ejemplos${NC}"
    exit 1
fi

echo -e "${BLUE}📁 Encontrados ${#examples[@]} ejemplos${NC}"
echo

updated=0
failed=0

for example in "${examples[@]}"; do
    # Remove trailing slash
    example=${example%/}
    package_path="${example}/package.json"
    
    if [ ! -f "$package_path" ]; then
        echo -e "${YELLOW}⚠️  ${example}: No tiene package.json${NC}"
        continue
    fi

    echo -e "${BLUE}🔄 Procesando ${BOLD}${example}${NC}..."
    
    # Check if syntropylog is in dependencies or devDependencies
    if grep -q "\"${PACKAGE_NAME}\"" "$package_path"; then
        # Get current version
        current_version=$(grep "\"${PACKAGE_NAME}\"" "$package_path" | head -1 | sed 's/.*"'"${PACKAGE_NAME}"'": *"\([^"]*\)".*/\1/')
        
        if [ "$current_version" != "$LOCAL_VERSION" ]; then
            echo -e "  ${PACKAGE_NAME}: ${current_version} → ${LOCAL_VERSION}"
            
            # Update the version in package.json (| delimiter; preserve trailing comma if present)
            if perl -pi -e "s|\"${PACKAGE_NAME}\":\s*\"[^\"]*\"(,)?|\"${PACKAGE_NAME}\": \"${LOCAL_VERSION}\"\1|g" "$package_path" 2>/dev/null; then
                echo -e "  ${GREEN}✅ ${example}: Actualizado${NC}"
                updated=$((updated + 1))
            else
                echo -e "  ${RED}❌ ${example}: Error al actualizar${NC}"
                failed=$((failed + 1))
            fi
        else
            echo -e "  ${YELLOW}ℹ️  ${example}: Ya usa versión local${NC}"
        fi
    else
        echo -e "  ${YELLOW}ℹ️  ${example}: No usa ${PACKAGE_NAME}${NC}"
    fi
done

echo
echo -e "${YELLOW}📊 Resumen:${NC}"
echo -e "  ${GREEN}✅ Actualizados: ${updated}${NC}"
echo -e "  ${RED}❌ Fallidos: ${failed}${NC}"
echo -e "  ${BLUE}📁 Total: ${#examples[@]}${NC}"

if [ $updated -gt 0 ]; then
    echo
    echo -e "${BLUE}💡 Para instalar dependencias actualizadas:${NC}"
    echo -e "   ${BOLD}npm install${NC}"
    echo
    echo -e "${YELLOW}⚠️  Nota: Los ejemplos ahora usan la versión local compilada${NC}"
    echo -e "   Esto es útil para desarrollo y testing"
fi

echo
echo -e "${GREEN}✅ Actualización completada!${NC}" 