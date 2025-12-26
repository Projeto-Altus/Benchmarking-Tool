import os
import sys
import subprocess
import platform

def run_command(command, description):
    print(f"\n>>> {description}...")
    try:
        # shell=True ajuda no Windows, mas check=True garante que pare se der erro
        subprocess.check_call(command, shell=True)
        print("    [OK]")
    except subprocess.CalledProcessError:
        print(f"    [ERRO] Falha ao executar: {command}")
        sys.exit(1)

def main():
    os_name = platform.system()
    print(f"--- Instalador Automático (Sistema detectado: {os_name}) ---")

    # 1. Atualizar PIP
    run_command(f"{sys.executable} -m pip install --upgrade pip", "Atualizando pip")

    # 2. Instalar Requirements
    run_command(f"{sys.executable} -m pip install -r requirements.txt", "Instalando bibliotecas do Python")

    # 3. Instalar Navegadores do Playwright
    # Nota: No Windows o comando é apenas 'playwright', no Linux pode precisar chamar via python module
    run_command(f"{sys.executable} -m playwright install", "Baixando navegadores do Playwright")

    # 4. Dependências de Sistema (Apenas Linux)
    if os_name == "Linux":
        print("\n>>> Verificando dependências do sistema Linux (pode pedir senha)...")
        # No Linux, precisa de sudo para instalar libs gráficas
        try:
            subprocess.check_call("sudo playwright install-deps", shell=True)
        except subprocess.CalledProcessError:
             print("    [AVISO] Falha no sudo. Se der erro ao abrir o navegador, rode 'sudo playwright install-deps' manualmente.")
    
    print("\n" + "="*40)
    print("INSTALAÇÃO CONCLUÍDA COM SUCESSO!")
    print("Para iniciar, rode: python app.py")
    print("="*40)

if __name__ == "__main__":
    main()