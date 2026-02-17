# -*- mode: python ; coding: utf-8 -*-
from PyInstaller.utils.hooks import collect_all

libs_to_force = [
    'flask', 'flask_cors', 'eel', 'playwright', 
    'pydantic', 'pydantic_core', 'validators', 'google', 'openai',
    'jinja2', 'werkzeug', 'itsdangerous', 'click'
]

datas = [('APP/dist', 'APP/dist'), ('API', 'API')]
binaries = []
hiddenimports = ['API.app', 'API.routes', 'API.services']

for lib in libs_to_force:
    tmp_ret = collect_all(lib)
    datas += tmp_ret[0]
    binaries += tmp_ret[1]
    hiddenimports += tmp_ret[2]

a = Analysis(
    ['main.py'],
    pathex=['.'],
    binaries=binaries,
    datas=datas,
    hiddenimports=hiddenimports,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=None,
    noarchive=False,
)
pyz = PYZ(a.pure, a.zipped_data, cipher=None)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='Altus Benchmarking Pro',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=False,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements=None,
)