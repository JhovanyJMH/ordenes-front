# # -*- coding: utf-8 -*-
# from pathlib import Path

# ROOT = Path(r"c:/laragon/www/S-OR/S-FRONT-O/src")

# def conv_cp1252(path):
#     p = Path(path)
#     text = p.read_bytes().decode("cp1252")
#     p.write_text(text, encoding="utf-8", newline="\n")
#     print("converted", p.name)

# def fix_form():
#     p = ROOT / "components/controlCambio/ControlCambioForm.jsx"
#     t = p.read_bytes().decode("latin-1")
#     t = t.replace("\ufffd", "\x9d")
#     pairs = [
#         ("Recreaci\x9dn", "Recreaci\u00f3n"),
#         ("Direcci\x9dn", "Direcci\u00f3n"),
#         ("Tecnolog\x9das", "Tecnolog\u00edas"),
#         ("Informaci\x9dn", "Informaci\u00f3n"),
#         ("An\x9dlisis", "An\u00e1lisis"),
#         ("an\x9dlisis", "an\u00e1lisis"),
#         ("Implementaci\x9dn", "Implementaci\u00f3n"),
#         ("implementaci\x9dn", "implementaci\u00f3n"),
#         ("N\x9dmero", "N\u00famero"),
#         ("cat\x9dlogo", "cat\u00e1logo"),
#         ("Descripci\x9dn", "Descripci\u00f3n"),
#         ("M\x9ddulo", "M\u00f3dulo"),
#         ("Justificaci\x9dn", "Justificaci\u00f3n"),
#         ("\x9drea", "\u00c1rea"),
#         ("reuni\x9dn", "reuni\u00f3n"),
#         ("Cr\x9dtico", "Cr\u00edtico"),
#         ("Clasificaci\x9dn", "Clasificaci\u00f3n"),
#         ("Aplicaci\x9dn", "Aplicaci\u00f3n"),
#         ("Soluci\x9dn", "Soluci\u00f3n"),
#         ("Autorizaci\x9dn", "Autorizaci\u00f3n"),
#         ("autorizaci\x9dn", "autorizaci\u00f3n"),
#         ("liberaci\x9dn", "liberaci\u00f3n"),
#         ("Producci\x9dn", "Producci\u00f3n"),
#         ("producci\x9dn", "producci\u00f3n"),
#         ("asignar\x9d", "asignar\u00e1"),
#         ("{isCompleted ? '?' : idx + 1}", "{isCompleted ? '\u2713' : idx + 1}"),
#         ("Siguiente ?", "Siguiente \u2192"),
#     ]
#     for a, b in pairs:
#         t = t.replace(a, b)
#     t = t.replace("|| '\x9d'", "|| '\u2014'")
#     leftover = t.count("\x9d")
#     print("form leftover 0x9d", leftover)
#     if leftover:
#         for i, ch in enumerate(t):
#             if ch == "\x9d":
#                 print(repr(t[max(0, i - 25): i + 25]))
#     p.write_text(t, encoding="utf-8", newline="\n")
#     print("wrote", p.name)

# conv_cp1252(ROOT / "components/controlCambio/ControlCambioList.jsx")
# conv_cp1252(ROOT / "pages/ControlCambioPage.jsx")
# fix_form()
