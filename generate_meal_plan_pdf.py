#!/usr/bin/env python3
"""Generate a comprehensive meal plan PDF with shopping lists for 3 adults + 1 child."""

from datetime import date, timedelta
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm, cm
from reportlab.lib.colors import HexColor
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, KeepTogether,
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import math
import os

# ── Constants ──
PORTIONS = 3.5  # 3 adults + 1 child (~0.5 adult)
START_DATE = date(2026, 4, 13)
END_DATE = date(2027, 12, 31)

# ── Colors ──
C_BG_DARK = HexColor("#0f172a")
C_BRAND = HexColor("#3b82f6")
C_BRAND_LIGHT = HexColor("#dbeafe")
C_SUCCESS = HexColor("#22c55e")
C_HEADER_BG = HexColor("#1e3a5f")
C_ROW_ALT = HexColor("#f0f4ff")
C_WHITE = HexColor("#ffffff")
C_BLACK = HexColor("#1a1a1a")
C_GRAY = HexColor("#64748b")
C_LIGHT_GRAY = HexColor("#f8fafc")
C_BORDER = HexColor("#cbd5e1")
C_SECTION_BG = HexColor("#eff6ff")
C_SNACK_BG = HexColor("#fef3c7")

DAY_NAMES_ES = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado", "Domingo"]
MONTH_NAMES_ES = ["", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
SEASON_LABELS = {"autumn": "Otono", "winter": "Invierno", "spring": "Primavera", "summer": "Verano"}
SEASON_ICONS = {"autumn": "Otono", "winter": "Invierno", "spring": "Primavera", "summer": "Verano"}

# ── Meal Data (all 16 week templates) ──
SNACKS = [
    {"name": "Nueces mixtas", "desc": "30g nueces + almendras", "cal": 190},
    {"name": "Queso con aceitunas", "desc": "2 fetas queso port salut + 6 aceitunas", "cal": 180},
    {"name": "Palta con limon", "desc": "1/2 palta con jugo de limon y pimienta", "cal": 160},
    {"name": "Huevo duro", "desc": "2 huevos duros con pimienta", "cal": 155},
    {"name": "Mix de semillas", "desc": "30g semillas de girasol, chia y lino", "cal": 170},
    {"name": "Bastones de pepino con queso crema", "desc": "Pepino en bastones + 2 cdas queso crema", "cal": 110},
    {"name": "Tomates cherry con aceite de oliva", "desc": "10 cherry con aceite de oliva y oregano", "cal": 100},
]

def _m(time, name, desc, cal):
    return {"time": time, "name": name, "desc": desc, "cal": cal}

def _d(lunch, dinner, snack_idx):
    return {"lunch": lunch, "dinner": dinner, "snack": SNACKS[snack_idx]}

WEEKS = [
    # Week 1 - Autumn
    {"num": 1, "season": "autumn", "days": [
        _d(_m("12:30", "Merluza a la plancha con ensalada", "Filet de merluza a la plancha con rucula, tomate, palta y aceite de oliva", 520),
           _m("19:00", "Omelette de espinaca y queso", "3 huevos con espinaca, queso port salut, pimienta", 450), 0),
        _d(_m("12:30", "Pollo grillado con brocoli", "Pechuga de pollo a la plancha con brocoli al vapor y aceite de oliva", 480),
           _m("19:00", "Ensalada de atun", "Atun en lata al natural con lechuga, huevo duro, tomate, aceitunas y aceite de oliva", 420), 1),
        _d(_m("12:30", "Caballa con ensalada mixta", "Caballa en lata con lechuga, zanahoria rallada, pepino y limon", 460),
           _m("19:00", "Zapallitos rellenos con carne", "Zapallitos rellenos con carne picada magra, cebolla, morron y queso rallado", 490), 4),
        _d(_m("12:30", "Revuelto de huevos con verduras", "3 huevos revueltos con champignones, espinaca y cebolla de verdeo", 430),
           _m("19:00", "Merluza al horno con calabaza", "Filet de merluza al horno con rodajas de calabaza y aceite de oliva", 460), 2),
        _d(_m("12:30", "Ensalada Cesar sin pan", "Lechuga, pechuga grillada, parmesano, huevo duro, aderezo de oliva y limon", 500),
           _m("19:00", "Hamburguesas caseras sin pan", "2 hamburguesas de carne magra con lechuga, tomate, pepinillo y mostaza", 520), 3),
        _d(_m("12:30", "Salmon rosado con palta", "Salmon rosado en lata con palta, rucula, tomate cherry y aceite de oliva", 540),
           _m("19:00", "Pollo al horno con berenjena", "Muslo de pollo al horno con berenjena grillada y aceite de oliva", 510), 5),
        _d(_m("12:30", "Asado magro con ensalada", "Entrana o vacio magro a la parrilla con ensalada de lechuga y tomate", 550),
           _m("19:00", "Sopa de verduras con huevo", "Sopa de zapallo, zanahoria, puerro con 2 huevos poche", 380), 6),
    ]},
    # Week 2 - Autumn
    {"num": 2, "season": "autumn", "days": [
        _d(_m("12:30", "Atun con palta y huevo", "Atun al natural con palta, huevo duro, tomate y aceite de oliva", 510),
           _m("19:00", "Milanesa de pollo al horno", "Milanesa de pollo al horno rebozada con almendras molidas, con lechuga y tomate", 480), 0),
        _d(_m("12:30", "Pollo al verdeo con zapallitos", "Pechuga fileteada con cebolla de verdeo, zapallitos salteados en aceite de oliva", 470),
           _m("19:00", "Huevos a la florentina", "3 huevos poche sobre espinaca salteada con queso rallado", 420), 2),
        _d(_m("12:30", "Merluza con salsa de limon", "Filet de merluza a la plancha con salsa de limon, alcaparras y ensalada", 450),
           _m("19:00", "Wok de verduras con pollo", "Pollo en tiritas con brocoli, morron, cebolla y salsa de soja", 490), 4),
        _d(_m("12:30", "Ensalada tibia de calabaza y queso", "Calabaza asada, rucula, queso de cabra, nueces y aceite de oliva", 480),
           _m("19:00", "Bife angosto con ensalada", "Bife angosto a la plancha con ensalada de rucula, tomate cherry y parmesano", 520), 1),
        _d(_m("12:30", "Caballa con verduras grilladas", "Caballa al horno con berenjena, morron y zucchini grillados", 490),
           _m("19:00", "Tortilla de espinaca y champignones", "Tortilla de 3 huevos con espinaca, champignones y cebolla", 430), 3),
        _d(_m("12:30", "Tarta sin masa de atun", "Atun, huevos, queso crema, cebolla, morron en budinera al horno", 500),
           _m("19:00", "Pollo al limon con esparragos", "Pechuga al horno con limon, esparragos y aceite de oliva", 440), 5),
        _d(_m("12:30", "Matambre a la pizza sin masa", "Fetas de matambre de cerdo con salsa de tomate, queso y oregano", 540),
           _m("19:00", "Crema de calabaza", "Crema de calabaza y puerro con semillas de girasol por encima", 350), 6),
    ]},
    # Week 3 - Autumn
    {"num": 3, "season": "autumn", "days": [
        _d(_m("12:30", "Trucha a la plancha", "Trucha a la plancha con ensalada de hinojo, naranja y rucula", 480),
           _m("19:00", "Revuelto gramajo sin papas", "Huevos revueltos con jamon natural, arvejas, cebolla y morron", 460), 0),
        _d(_m("12:30", "Pollo con curry y coliflor", "Pechuga en cubos con coliflor, curry, crema y curcuma", 510),
           _m("19:00", "Ensalada de salmon rosado", "Salmon rosado en lata, palta, pepino, semillas de sesamo, limon", 490), 2),
        _d(_m("12:30", "Milanesa de merluza al horno", "Filet rebozado en almendras molidas al horno con ensalada de repollo", 470),
           _m("19:00", "Berenjenas rellenas", "Berenjenas rellenas con carne picada, tomate, cebolla y queso gratinado", 500), 1),
        _d(_m("12:30", "Wrap de lechuga con pollo", "Hojas de lechuga rellenas con pollo desmenuzado, palta, tomate y mostaza", 440),
           _m("19:00", "Merluza al horno con tomate", "Filet de merluza con rodajas de tomate, aceitunas, alcaparras y aceite", 430), 4),
        _d(_m("12:30", "Ensalada de pollo y nueces", "Pollo grillado, nueces, palta, apio, lechuga, aderezo de limon", 520),
           _m("19:00", "Tortilla de calabaza y queso", "Tortilla de 3 huevos con calabaza asada y queso de cabra", 460), 3),
        _d(_m("12:30", "Ceviche de merluza", "Merluza marinada en limon con cebolla morada, cilantro, palta y aji", 380),
           _m("19:00", "Pollo a la mostaza con espinaca", "Pechuga al horno con mostaza, espinaca salteada con ajo", 470), 5),
        _d(_m("12:30", "Asado de tira magro", "Tira de asado magra con ensalada mixta grande", 560),
           _m("19:00", "Sopa de pollo y verduras", "Caldo de pollo con zanahoria, apio, zapallito y espinaca", 360), 6),
    ]},
    # Week 4 - Autumn
    {"num": 4, "season": "autumn", "days": [
        _d(_m("12:30", "Atun con ensalada mediterranea", "Atun al natural con tomate, pepino, aceitunas negras, cebolla morada y aceite de oliva", 470),
           _m("19:00", "Pollo al pimenton con brocoli", "Pechuga al horno con pimenton ahumado, brocoli al vapor", 460), 0),
        _d(_m("12:30", "Ensalada de caballa y huevo", "Caballa en lata, 2 huevos duros, lechuga, tomate cherry, aceite de oliva", 500),
           _m("19:00", "Zapallo anco relleno", "Zapallo anco relleno con carne, cebolla, queso y especias", 480), 2),
        _d(_m("12:30", "Bowl de pollo y palta", "Pollo desmenuzado, palta, tomate, pepino, semillas de chia, limon", 510),
           _m("19:00", "Merluza en papillote", "Filet de merluza al horno en papel aluminio con cebolla, morron y limon", 400), 4),
        _d(_m("12:30", "Revuelto de esparragos y queso", "3 huevos revueltos con esparragos, queso de cabra y pimienta", 440),
           _m("19:00", "Bife de chorizo con ensalada", "Bife de chorizo magro a la plancha con ensalada de rucula y parmesano", 530), 1),
        _d(_m("12:30", "Salmon con vegetales asados", "Salmon rosado al horno con zucchini, berenjena y morron asados", 500),
           _m("19:00", "Huevos rellenos con atun", "4 mitades de huevo rellenas con atun, mayonesa light y ensalada verde", 420), 3),
        _d(_m("12:30", "Pollo a las finas hierbas", "Pechuga al horno con romero, tomillo, ajo y ensalada de tomate y cebolla", 470),
           _m("19:00", "Tarta sin masa de verduras", "Espinaca, brocoli, huevos, queso crema en budinera al horno", 430), 5),
        _d(_m("12:30", "Vacio a la parrilla con chimichurri", "Vacio magro con chimichurri casero y ensalada mixta", 560),
           _m("19:00", "Crema de brocoli con queso", "Crema de brocoli con queso port salut y semillas", 380), 6),
    ]},
    # Week 5 - Winter
    {"num": 5, "season": "winter", "days": [
        _d(_m("12:30", "Guiso de pollo liviano", "Pollo con zapallo, zanahoria, cebolla, pimenton (sin papa ni fideos)", 490),
           _m("19:00", "Omelette de jamon y queso", "3 huevos con jamon natural y queso port salut", 440), 0),
        _d(_m("12:30", "Merluza con salsa provenzal", "Filet al horno con ajo, perejil, aceite de oliva y ensalada", 460),
           _m("19:00", "Sopa crema de calabaza con pollo", "Crema de calabaza con trozos de pollo y semillas de girasol", 470), 2),
        _d(_m("12:30", "Pollo al escabeche casero", "Pechuga en escabeche con zanahoria, cebolla, laurel y vinagre", 480),
           _m("19:00", "Tortilla de coliflor", "3 huevos con coliflor, cebolla y queso rallado", 420), 4),
        _d(_m("12:30", "Estofado de carne liviano", "Carne magra con zapallo, choclo, tomate (sin papa)", 520),
           _m("19:00", "Ensalada tibia de atun", "Atun al natural con chauchas, huevo, tomate, aceite de oliva", 440), 1),
        _d(_m("12:30", "Caballa al horno con verduras", "Caballa fresca al horno con cebolla, morron y tomate", 470),
           _m("19:00", "Budin de espinaca y queso", "Espinaca, huevos, queso crema, nuez moscada al horno", 430), 3),
        _d(_m("12:30", "Bondiola al horno con ensalada", "Bondiola magra asada con ensalada de repollo y zanahoria", 540),
           _m("19:00", "Crema de puerro y apio", "Crema de puerro con apio, cebolla y queso rallado", 350), 5),
        _d(_m("12:30", "Costillas de cerdo al horno", "Costillitas al horno con pimenton, ajo y ensalada", 570),
           _m("19:00", "Sopa de verduras con huevo", "Sopa de zapallito, zanahoria, espinaca con 2 huevos", 370), 6),
    ]},
    # Week 6 - Winter
    {"num": 6, "season": "winter", "days": [
        _d(_m("12:30", "Cazuela de merluza", "Merluza con caldo, zanahoria, puerro, zapallito y pimienta", 440),
           _m("19:00", "Revuelto de champignones y queso", "3 huevos con champignones, cebolla de verdeo y queso de cabra", 450), 0),
        _d(_m("12:30", "Pollo al curry con coliflor", "Muslo de pollo deshuesado con coliflor, curry, crema liviana", 510),
           _m("19:00", "Tarta sin masa de atun y morron", "Atun, huevos, queso crema, morron asado en budinera", 460), 2),
        _d(_m("12:30", "Bife a la criolla", "Bife de cuadril con salsa de tomate, cebolla, morron y huevo frito", 530),
           _m("19:00", "Ensalada de huevo y palta", "3 huevos duros, palta, rucula, tomate cherry, aceite de oliva", 460), 4),
        _d(_m("12:30", "Atun al horno con vegetales", "Atun fresco o en lata al horno con cebolla, tomate y aceitunas", 480),
           _m("19:00", "Locro liviano", "Zapallo, porotos (porcion chica), carne magra, cebolla de verdeo", 470), 1),
        _d(_m("12:30", "Pollo grillado con rucula y parmesano", "Pechuga grillada sobre rucula con parmesano y limon", 480),
           _m("19:00", "Merluza con pure de coliflor", "Filet a la plancha con pure de coliflor con queso crema", 430), 3),
        _d(_m("12:30", "Cerdo a la mostaza con zapallo", "Solomillo de cerdo al horno con mostaza y zapallo asado", 530),
           _m("19:00", "Sopa de tomate y albahaca", "Sopa de tomate casera con albahaca, aceite de oliva y queso", 340), 5),
        _d(_m("12:30", "Entrana a la parrilla", "Entrana con chimichurri y ensalada de lechuga, tomate y cebolla", 550),
           _m("19:00", "Crema de zanahoria y jengibre", "Crema de zanahoria con jengibre, curcuma y semillas", 340), 6),
    ]},
    # Week 7 - Winter
    {"num": 7, "season": "winter", "days": [
        _d(_m("12:30", "Carbonada liviana", "Carne en cubos con zapallo, choclo, zanahoria (sin papa ni batata)", 510),
           _m("19:00", "Tortilla de puerro y queso", "3 huevos con puerro salteado y queso rallado", 430), 0),
        _d(_m("12:30", "Merluza negra a la plancha", "Merluza negra con ensalada de hinojo, rucula y almendras", 470),
           _m("19:00", "Pollo con vegetales al wok", "Pollo en tiritas con brocoli, morron, zucchini y salsa de soja", 480), 2),
        _d(_m("12:30", "Hamburguesas de atun caseras", "2 hamburguesas de atun con huevo, cebolla + ensalada", 460),
           _m("19:00", "Zapallitos gratinados", "Zapallitos rellenos con queso crema, cebolla y gratinados", 410), 4),
        _d(_m("12:30", "Pollo al verdeo con pure de calabaza", "Pechuga con cebolla de verdeo y pure de calabaza", 490),
           _m("19:00", "Ensalada de caballa y legumbres", "Caballa con porcion chica de lentejas, tomate, cebolla, limon", 460), 1),
        _d(_m("12:30", "Bifecitos de cerdo con ensalada", "Bifecitos de cerdo a la plancha con ensalada de repollo colorado", 500),
           _m("19:00", "Huevos al horno con tomate", "3 huevos al horno en salsa de tomate con cebolla y morron", 420), 3),
        _d(_m("12:30", "Salmon rosado con ensalada", "Salmon rosado en lata con palta, pepino, semillas y limon", 510),
           _m("19:00", "Guiso de pollo y verduras", "Pollo con zapallo, zanahoria, cebolla (sin papa ni fideos)", 470), 5),
        _d(_m("12:30", "Asado de vacio con chimichurri", "Vacio magro a la parrilla con chimichurri y ensalada mixta", 560),
           _m("19:00", "Sopa crema de espinaca", "Crema de espinaca con queso crema y nuez moscada", 360), 6),
    ]},
    # Week 8 - Winter
    {"num": 8, "season": "winter", "days": [
        _d(_m("12:30", "Peceto al horno con vegetales", "Peceto con zanahoria, cebolla, zapallo al horno", 500),
           _m("19:00", "Omelette de queso y tomate", "3 huevos con queso de cabra, tomate seco y albahaca", 440), 0),
        _d(_m("12:30", "Merluza con almendras", "Filet al horno con costra de almendras molidas y ensalada", 490),
           _m("19:00", "Ensalada tibia de pollo", "Pollo grillado con zapallitos asados, rucula y parmesano", 470), 2),
        _d(_m("12:30", "Caballa con pure de coliflor", "Caballa al horno con pure de coliflor y aceite de oliva", 460),
           _m("19:00", "Budin de zapallitos", "Zapallitos rallados, huevos, queso rallado y cebolla al horno", 400), 4),
        _d(_m("12:30", "Pollo a la naranja liviano", "Pechuga con jugo de naranja, jengibre y brocoli al vapor", 480),
           _m("19:00", "Atun con ensalada de repollo", "Atun al natural con repollo blanco, zanahoria rallada y limon", 410), 1),
        _d(_m("12:30", "Bife de lomo con esparragos", "Lomo a la plancha con esparragos grillados y aceite de oliva", 500),
           _m("19:00", "Tortilla de verduras mixta", "3 huevos con espinaca, cebolla, morron y queso", 440), 3),
        _d(_m("12:30", "Trucha al horno con hierbas", "Trucha con romero, limon, ajo y ensalada verde", 480),
           _m("19:00", "Crema de zapallo y puerro", "Crema de zapallo con puerro, queso crema y semillas", 370), 5),
        _d(_m("12:30", "Matambre de cerdo al horno", "Matambre tiernizado al horno con ensalada fresca", 550),
           _m("19:00", "Sopa de verduras abundante", "Sopa de zapallito, choclo desgranado, espinaca y cebolla", 340), 6),
    ]},
    # Week 9 - Spring
    {"num": 9, "season": "spring", "days": [
        _d(_m("12:30", "Ensalada de salmon y palta", "Salmon rosado con palta, rucula, pepino, semillas de sesamo", 520),
           _m("19:00", "Pollo a la plancha con ensalada", "Pechuga con lechuga, tomate, zanahoria rallada y aceite de oliva", 440), 0),
        _d(_m("12:30", "Merluza con taboule de coliflor", "Filet a la plancha con coliflor procesada, perejil, tomate, limon", 450),
           _m("19:00", "Huevos rancheros sin tortilla", "3 huevos fritos en salsa de tomate con cebolla, morron y cilantro", 430), 2),
        _d(_m("12:30", "Pollo con ensalada griega", "Pechuga grillada con pepino, tomate, aceitunas, queso feta y oregano", 500),
           _m("19:00", "Caballa con ensalada de remolacha", "Caballa con remolacha rallada, huevo duro y cebolla morada", 450), 4),
        _d(_m("12:30", "Bowl de atun y verduras", "Atun al natural con palta, pepino, zanahoria, semillas de chia", 480),
           _m("19:00", "Zapallitos a la provenzal con huevo", "Zapallitos salteados con ajo, perejil y 2 huevos fritos", 400), 1),
        _d(_m("12:30", "Bife con chimichurri y verduras", "Bife angosto con chimichurri y verduras grilladas", 530),
           _m("19:00", "Ensalada tibia de pollo y calabaza", "Pollo grillado con calabaza asada, rucula y semillas", 460), 3),
        _d(_m("12:30", "Trucha con almendras", "Trucha a la plancha con almendras tostadas y ensalada verde", 510),
           _m("19:00", "Tarta sin masa de espinaca", "Espinaca, ricota, huevos, nuez moscada al horno", 420), 5),
        _d(_m("12:30", "Asado de entrana con ensalada", "Entrana a la parrilla con ensalada de lechuga, tomate y cebolla", 550),
           _m("19:00", "Gazpacho con huevo", "Gazpacho frio de tomate, pepino, morron con huevo duro picado", 320), 6),
    ]},
    # Week 10 - Spring
    {"num": 10, "season": "spring", "days": [
        _d(_m("12:30", "Merluza a la vasca", "Merluza con salsa de perejil, ajo, arvejas y esparragos", 460),
           _m("19:00", "Revuelto de esparragos y champignones", "3 huevos con esparragos, champignones y cebolla de verdeo", 420), 0),
        _d(_m("12:30", "Pollo con pesto de rucula", "Pechuga grillada con pesto de rucula y nueces, tomate cherry", 510),
           _m("19:00", "Ensalada de caballa y huevo", "Caballa, 2 huevos duros, lechuga, pepino, aceite de oliva", 460), 2),
        _d(_m("12:30", "Salmon con vegetales salteados", "Salmon rosado con zucchini, berenjena y morron salteados", 520),
           _m("19:00", "Omelette de espinaca y tomate seco", "3 huevos con espinaca y tomate seco rehidratado", 430), 4),
        _d(_m("12:30", "Atun con ensalada caprese", "Atun al natural con tomate, muzzarella fresca, albahaca y aceite", 490),
           _m("19:00", "Pollo al limon con esparragos", "Pechuga al horno con limon y esparragos grillados", 440), 1),
        _d(_m("12:30", "Cerdo a la provenzal con brocoli", "Bifecitos de cerdo con ajo, perejil y brocoli al vapor", 500),
           _m("19:00", "Berenjenas a la napolitana", "Berenjenas grilladas con salsa de tomate y queso gratinado", 420), 3),
        _d(_m("12:30", "Bowl mediterraneo de pescado", "Merluza grillada con aceitunas, tomate, pepino, palta y limon", 490),
           _m("19:00", "Huevos al horno con espinaca", "3 huevos al horno sobre espinaca con queso de cabra", 440), 5),
        _d(_m("12:30", "Vacio a la parrilla primaveral", "Vacio magro con ensalada de rucula, parmesano y limon", 550),
           _m("19:00", "Sopa fria de pepino y menta", "Pepino, yogur natural, menta, limon y aceite de oliva", 280), 6),
    ]},
    # Week 11 - Spring
    {"num": 11, "season": "spring", "days": [
        _d(_m("12:30", "Trucha con ensalada primaveral", "Trucha a la plancha con rucula, rabanitos, pepino y nueces", 490),
           _m("19:00", "Tortilla de esparragos y queso", "3 huevos con esparragos y queso de cabra", 430), 0),
        _d(_m("12:30", "Pollo mediterraneo", "Pechuga al horno con tomate cherry, aceitunas, alcaparras y oregano", 480),
           _m("19:00", "Merluza con ensalada de hinojo", "Filet a la plancha con hinojo, naranja y rucula", 430), 2),
        _d(_m("12:30", "Ensalada de pollo y frutos secos", "Pollo grillado con almendras, nueces, apio, lechuga y mostaza", 520),
           _m("19:00", "Budin de verduras mixtas", "Zucchini, zanahoria, huevos, queso y cebolla al horno", 410), 4),
        _d(_m("12:30", "Caballa con vegetales a la plancha", "Caballa con berenjena, zucchini y morron grillados", 480),
           _m("19:00", "Revuelto de tomate y cebolla", "3 huevos con tomate, cebolla caramelizada y pimienta", 400), 1),
        _d(_m("12:30", "Bife con ensalada de rucula y palta", "Bife de chorizo con rucula, palta, tomate cherry y limon", 540),
           _m("19:00", "Merluza al limon con espinaca", "Filet con limon y espinaca salteada con ajo", 420), 3),
        _d(_m("12:30", "Ceviche de merluza primaveral", "Merluza en limon con cebolla morada, cilantro, palta y aji", 380),
           _m("19:00", "Pollo relleno de espinaca", "Pechuga rellena con espinaca y queso al horno", 490), 5),
        _d(_m("12:30", "Asado de tira con ensalada", "Tira de asado magra con ensalada mixta grande", 560),
           _m("19:00", "Gazpacho con palta", "Gazpacho frio de tomate con dados de palta y aceite de oliva", 320), 6),
    ]},
    # Week 12 - Spring
    {"num": 12, "season": "spring", "days": [
        _d(_m("12:30", "Salmon con ensalada de pepino", "Salmon rosado con pepino, eneldo, limon y aceite de oliva", 500),
           _m("19:00", "Pollo a la mostaza con brocoli", "Pechuga al horno con mostaza y brocoli al vapor", 460), 0),
        _d(_m("12:30", "Atun con tabule de coliflor", "Atun al natural con coliflor procesada, tomate, perejil, limon", 440),
           _m("19:00", "Omelette de champignones y queso", "3 huevos con champignones, queso de cabra y pimienta", 440), 2),
        _d(_m("12:30", "Pollo grillado con palta y tomate", "Pechuga con palta, tomate, lechuga y aderezo de limon", 500),
           _m("19:00", "Merluza a la plancha con ensalada", "Filet con ensalada de rucula, rabanitos y pepino", 420), 4),
        _d(_m("12:30", "Ensalada nicoise argentina", "Atun, huevo duro, chauchas, tomate, aceitunas, anchoas", 490),
           _m("19:00", "Zapallitos rellenos gratinados", "Zapallitos con carne magra, cebolla y queso gratinado", 470), 1),
        _d(_m("12:30", "Lomo a la pimienta con esparragos", "Medallones de lomo con pimienta negra y esparragos", 510),
           _m("19:00", "Tarta sin masa de brocoli y queso", "Brocoli, huevos, queso crema, cebolla en budinera", 420), 3),
        _d(_m("12:30", "Trucha con almendras y ensalada", "Trucha al horno con almendras y ensalada verde", 500),
           _m("19:00", "Huevos revueltos con verduras", "3 huevos con espinaca, tomate cherry y aceite de oliva", 400), 5),
        _d(_m("12:30", "Entrana a la parrilla con ensalada", "Entrana con chimichurri y ensalada primaveral", 550),
           _m("19:00", "Sopa fria de tomate y albahaca", "Tomate, albahaca, aceite de oliva y queso rallado", 300), 6),
    ]},
    # Week 13 - Summer
    {"num": 13, "season": "summer", "days": [
        _d(_m("12:30", "Ceviche de merluza veraniego", "Merluza en limon con mango, cebolla morada, cilantro y aji", 380),
           _m("19:00", "Pollo frio con ensalada", "Pechuga grillada fria con lechuga, tomate, pepino y vinagreta", 440), 0),
        _d(_m("12:30", "Ensalada de salmon y palta", "Salmon rosado, palta, pepino, rucula, semillas de sesamo y limon", 520),
           _m("19:00", "Gazpacho con huevo y atun", "Gazpacho frio de tomate con atun desmenuzado y huevo picado", 400), 2),
        _d(_m("12:30", "Pollo con ensalada caprese", "Pechuga grillada con tomate, muzzarella fresca, albahaca", 500),
           _m("19:00", "Merluza fria con vinagreta", "Filet de merluza frio con vinagreta de limon, pepino y eneldo", 400), 4),
        _d(_m("12:30", "Bowl de atun veraniego", "Atun al natural con palta, mango, pepino, semillas y limon", 480),
           _m("19:00", "Ensalada de huevo y verduras", "3 huevos duros con chauchas, tomate cherry, aceitunas", 410), 1),
        _d(_m("12:30", "Bife frio con ensalada", "Bife frio en fetas con rucula, parmesano, tomate y limon", 520),
           _m("19:00", "Wrap de lechuga con caballa", "Hojas de lechuga con caballa, palta, zanahoria rallada", 430), 3),
        _d(_m("12:30", "Trucha a la plancha con limon", "Trucha con limon, alcaparras y ensalada de pepino", 470),
           _m("19:00", "Ensalada griega", "Tomate, pepino, aceitunas, queso feta, cebolla morada, oregano", 380), 5),
        _d(_m("12:30", "Asado de vacio veraniego", "Vacio magro con ensalada rusa sin papa", 540),
           _m("19:00", "Tomates rellenos frios", "Tomates rellenos de atun, huevo, aceitunas y mayonesa light", 360), 6),
    ]},
    # Week 14 - Summer
    {"num": 14, "season": "summer", "days": [
        _d(_m("12:30", "Ensalada de pollo y frutos secos", "Pollo grillado frio con almendras, nueces, lechuga, apio y limon", 510),
           _m("19:00", "Merluza con salsa criolla", "Filet a la plancha con salsa criolla de tomate, cebolla y morron", 420), 0),
        _d(_m("12:30", "Carpaccio de carne con rucula", "Carne cruda en laminas con rucula, parmesano, alcaparras y limon", 440),
           _m("19:00", "Ensalada de caballa y pepino", "Caballa con pepino, tomate cherry, cebolla morada y aceite de oliva", 450), 2),
        _d(_m("12:30", "Bowl de salmon y palta", "Salmon rosado con palta, rucula, semillas, pepino y sesamo", 530),
           _m("19:00", "Tortilla fria de verduras", "Tortilla fria de 3 huevos con zapallito y morron", 420), 4),
        _d(_m("12:30", "Pollo a la naranja con ensalada", "Pechuga fria marinada en naranja con ensalada verde y nueces", 490),
           _m("19:00", "Atun con ensalada de apio y palta", "Atun al natural con apio, palta, limon y pimienta", 450), 1),
        _d(_m("12:30", "Lomo frio con vegetales", "Lomo frio en laminas con berenjena grillada, morron y rucula", 500),
           _m("19:00", "Huevos rellenos con verduras", "4 mitades rellenas con palta, cebolla de verdeo y pimienta", 380), 3),
        _d(_m("12:30", "Merluza con pesto de albahaca", "Filet al horno con pesto de albahaca y nueces, tomate cherry", 480),
           _m("19:00", "Ensalada grande de verano", "Lechuga, tomate, pepino, zanahoria, huevo, aceitunas, queso", 400), 5),
        _d(_m("12:30", "Costillas al limon y hierbas", "Costillas de cerdo al horno con limon, romero y ensalada", 560),
           _m("19:00", "Vichyssoise de puerro sin papa", "Crema fria de puerro con coliflor, cebolla y aceite de oliva", 300), 6),
    ]},
    # Week 15 - Summer
    {"num": 15, "season": "summer", "days": [
        _d(_m("12:30", "Atun fresco a la plancha", "Atun a la plancha con ensalada de rucula, tomate cherry y palta", 510),
           _m("19:00", "Pollo frio desmenuzado", "Pollo desmenuzado con pepino, zanahoria rallada, limon y pimienta", 420), 0),
        _d(_m("12:30", "Ensalada de merluza y huevo", "Merluza grillada con 2 huevos duros, lechuga, tomate y aceite", 460),
           _m("19:00", "Berenjenas rellenas frias", "Berenjenas rellenas de atun, tomate, aceitunas y queso", 440), 2),
        _d(_m("12:30", "Pollo con tabule de coliflor", "Pechuga grillada con coliflor procesada, perejil, tomate, limon", 470),
           _m("19:00", "Caballa con ensalada de pepino", "Caballa en lata con pepino, rabanitos, eneldo y limon", 430), 4),
        _d(_m("12:30", "Salmon rosado con verduras frescas", "Salmon rosado con palta, pepino, lechuga y semillas", 520),
           _m("19:00", "Revuelto frio de huevos", "3 huevos revueltos frios con tomate, albahaca y aceite", 400), 1),
        _d(_m("12:30", "Bife con chimichurri y vegetales", "Bife angosto con chimichurri y vegetales grillados", 540),
           _m("19:00", "Ensalada de pollo y nueces", "Pollo frio con nueces, apio, lechuga y limon", 470), 3),
        _d(_m("12:30", "Trucha con ensalada de hinojo", "Trucha grillada con hinojo, naranja y rucula", 480),
           _m("19:00", "Tarta sin masa de verduras verdes", "Espinaca, brocoli, zucchini, huevos y queso al horno", 420), 5),
        _d(_m("12:30", "Asado de entrana veraniego", "Entrana a la parrilla con ensalada de tomate y cebolla", 550),
           _m("19:00", "Gazpacho andaluz", "Tomate, pepino, morron, ajo, aceite de oliva y vinagre", 280), 6),
    ]},
    # Week 16 - Summer
    {"num": 16, "season": "summer", "days": [
        _d(_m("12:30", "Merluza con salsa de palta", "Filet a la plancha con salsa de palta, limon y cilantro", 480),
           _m("19:00", "Ensalada de pollo y palta", "Pollo grillado frio con palta, tomate cherry y rucula", 460), 0),
        _d(_m("12:30", "Atun a la provenzal", "Atun al natural con ajo, perejil, tomate y ensalada verde", 440),
           _m("19:00", "Omelette de palta y tomate", "3 huevos con palta, tomate y queso de cabra", 460), 2),
        _d(_m("12:30", "Pollo al pesto con tomate", "Pechuga con pesto de albahaca y nueces, tomate cherry", 510),
           _m("19:00", "Caballa con ensalada fresca", "Caballa con lechuga, pepino, zanahoria rallada y limon", 420), 4),
        _d(_m("12:30", "Bowl de salmon veraniego", "Salmon rosado con pepino, palta, rucula y semillas de chia", 520),
           _m("19:00", "Huevos al plato con tomate", "3 huevos al horno en salsa de tomate, oregano y queso", 430), 1),
        _d(_m("12:30", "Cerdo con ensalada de repollo", "Bifecitos de cerdo con ensalada de repollo, zanahoria y limon", 500),
           _m("19:00", "Ensalada de atun y chauchas", "Atun con chauchas, tomate cherry, huevo y aceite de oliva", 430), 3),
        _d(_m("12:30", "Trucha con palta y limon", "Trucha a la plancha con palta machacada y limon", 500),
           _m("19:00", "Ensalada caprese con nueces", "Tomate, muzzarella, albahaca, nueces y aceite de oliva", 420), 5),
        _d(_m("12:30", "Vacio a la parrilla de verano", "Vacio magro con chimichurri y ensalada fresca completa", 560),
           _m("19:00", "Sopa fria de pepino y palta", "Pepino, palta, limon, menta y aceite de oliva frios", 300), 6),
    ]},
]

# ── Shopping lists per week (ingredients with base quantities for 1 person) ──
# Multiplied by PORTIONS at render time
# Format: {"category": [("item", "qty_base", "unit"), ...]}

def _shopping(week_num):
    """Return shopping list for a given week template. Quantities are per 1 adult."""
    # Common base items every week
    base = {
        "Almacen / Condimentos": [
            ("Aceite de oliva extra virgen", 250, "ml"),
            ("Pimienta negra molida", 1, "frasco"),
            ("Oregano", 1, "sobre"),
        ],
        "Bebidas": [
            ("Agua mineral o filtrada", 10, "litros"),
            ("Pomelos (para jugo 1-2x/sem)", 1, "unid"),
        ],
    }

    specific = {
        1: {
            "Pescaderia / Latas": [
                ("Filet de merluza", 500, "g"),
                ("Lata de atun al natural", 2, "unid"),
                ("Lata de caballa al natural", 1, "unid"),
                ("Lata de salmon rosado", 1, "unid"),
            ],
            "Carniceria": [
                ("Pechuga de pollo", 700, "g"),
                ("Muslo de pollo", 400, "g"),
                ("Carne picada magra", 250, "g"),
                ("Carne para hamburguesa magra", 350, "g"),
                ("Entrana o vacio magro", 400, "g"),
            ],
            "Huevos y Lacteos": [
                ("Huevos", 24, "unid"),
                ("Queso port salut", 200, "g"),
                ("Queso parmesano", 80, "g"),
                ("Queso crema", 200, "g"),
                ("Queso rallado", 100, "g"),
            ],
            "Verduleria": [
                ("Rucula", 2, "bandejas"),
                ("Lechuga", 2, "unid"),
                ("Espinaca", 2, "atados"),
                ("Brocoli", 1, "unid"),
                ("Tomate", 8, "unid"),
                ("Tomate cherry", 1, "bandeja"),
                ("Palta", 4, "unid"),
                ("Zapallitos", 5, "unid"),
                ("Calabaza", 400, "g"),
                ("Zanahoria", 4, "unid"),
                ("Pepino", 2, "unid"),
                ("Cebolla", 4, "unid"),
                ("Cebolla de verdeo", 1, "atado"),
                ("Morron rojo/verde", 2, "unid"),
                ("Champignones", 1, "bandeja"),
                ("Berenjena", 1, "unid"),
                ("Puerro", 1, "unid"),
                ("Zapallo", 400, "g"),
                ("Limones", 5, "unid"),
                ("Pepinillos en vinagre", 1, "frasco"),
            ],
            "Dietetica": [
                ("Nueces", 150, "g"),
                ("Almendras", 150, "g"),
                ("Semillas de girasol", 80, "g"),
                ("Semillas de chia", 80, "g"),
                ("Semillas de lino", 80, "g"),
            ],
        },
        2: {
            "Pescaderia / Latas": [
                ("Filet de merluza", 300, "g"),
                ("Lata de atun al natural", 2, "unid"),
                ("Lata de caballa al natural", 1, "unid"),
            ],
            "Carniceria": [
                ("Pechuga de pollo", 800, "g"),
                ("Bife angosto", 300, "g"),
                ("Matambre de cerdo", 400, "g"),
                ("Almendras molidas (para rebozar)", 100, "g"),
            ],
            "Huevos y Lacteos": [
                ("Huevos", 24, "unid"),
                ("Queso de cabra", 150, "g"),
                ("Queso crema", 200, "g"),
                ("Queso rallado", 150, "g"),
                ("Parmesano", 80, "g"),
            ],
            "Verduleria": [
                ("Rucula", 2, "bandejas"),
                ("Lechuga", 2, "unid"),
                ("Espinaca", 2, "atados"),
                ("Brocoli", 1, "unid"),
                ("Tomate", 6, "unid"),
                ("Tomate cherry", 1, "bandeja"),
                ("Palta", 2, "unid"),
                ("Zapallitos", 3, "unid"),
                ("Calabaza", 500, "g"),
                ("Cebolla", 4, "unid"),
                ("Cebolla de verdeo", 1, "atado"),
                ("Morron", 3, "unid"),
                ("Champignones", 1, "bandeja"),
                ("Berenjena", 1, "unid"),
                ("Zucchini", 2, "unid"),
                ("Puerro", 1, "unid"),
                ("Esparragos", 1, "atado"),
                ("Limones", 5, "unid"),
                ("Alcaparras", 1, "frasco chico"),
                ("Salsa de tomate", 1, "lata"),
                ("Salsa de soja", 1, "botella chica"),
            ],
            "Dietetica": [
                ("Nueces", 150, "g"),
                ("Almendras", 100, "g"),
                ("Semillas de girasol", 80, "g"),
                ("Semillas de chia", 60, "g"),
                ("Semillas de lino", 60, "g"),
            ],
        },
    }

    # For weeks 3-16, generate a reasonable generic list based on the meals
    generic_fish_weeks = {
        3: [("Trucha", 400, "g"), ("Filet de merluza", 500, "g"), ("Lata de salmon rosado", 1, "unid")],
        4: [("Filet de merluza", 300, "g"), ("Lata de atun al natural", 2, "unid"), ("Lata de caballa", 1, "unid"), ("Lata de salmon rosado", 1, "unid")],
        5: [("Filet de merluza", 300, "g"), ("Caballa fresca o lata", 1, "unid"), ("Lata de atun al natural", 1, "unid")],
        6: [("Filet de merluza", 500, "g"), ("Lata de atun al natural", 2, "unid"), ("Lata de caballa", 1, "unid")],
        7: [("Merluza negra o comun", 300, "g"), ("Lata de atun al natural", 2, "unid"), ("Lata de caballa", 1, "unid"), ("Lata de salmon rosado", 1, "unid")],
        8: [("Filet de merluza", 300, "g"), ("Trucha", 400, "g"), ("Lata de atun al natural", 1, "unid"), ("Lata de caballa", 1, "unid")],
        9: [("Filet de merluza", 300, "g"), ("Trucha", 400, "g"), ("Lata de salmon rosado", 1, "unid"), ("Lata de atun al natural", 1, "unid"), ("Lata de caballa", 1, "unid")],
        10: [("Filet de merluza", 500, "g"), ("Lata de salmon rosado", 1, "unid"), ("Lata de caballa", 1, "unid"), ("Lata de atun al natural", 1, "unid")],
        11: [("Trucha", 400, "g"), ("Filet de merluza", 500, "g"), ("Lata de caballa", 1, "unid")],
        12: [("Filet de merluza", 300, "g"), ("Trucha", 400, "g"), ("Lata de atun al natural", 2, "unid"), ("Lata de salmon rosado", 1, "unid")],
        13: [("Filet de merluza", 500, "g"), ("Trucha", 400, "g"), ("Lata de salmon rosado", 1, "unid"), ("Lata de atun al natural", 1, "unid"), ("Lata de caballa", 1, "unid")],
        14: [("Filet de merluza", 400, "g"), ("Lata de salmon rosado", 1, "unid"), ("Lata de caballa", 1, "unid"), ("Lata de atun al natural", 1, "unid")],
        15: [("Filet de merluza", 300, "g"), ("Trucha", 400, "g"), ("Lata de salmon rosado", 1, "unid"), ("Lata de atun al natural", 1, "unid"), ("Lata de caballa", 1, "unid")],
        16: [("Filet de merluza", 300, "g"), ("Trucha", 400, "g"), ("Lata de salmon rosado", 1, "unid"), ("Lata de atun al natural", 2, "unid"), ("Lata de caballa", 1, "unid")],
    }

    generic_meat_weeks = {
        3: [("Pechuga de pollo", 800, "g"), ("Carne picada magra", 300, "g"), ("Tira de asado magra", 500, "g")],
        4: [("Pechuga de pollo", 700, "g"), ("Bife de chorizo", 350, "g"), ("Vacio magro", 400, "g"), ("Carne picada o zapallo anco", 300, "g")],
        5: [("Pechuga de pollo", 800, "g"), ("Carne magra (cuadril)", 400, "g"), ("Bondiola magra", 400, "g"), ("Costillas de cerdo", 500, "g"), ("Jamon natural", 150, "g")],
        6: [("Pechuga/muslo de pollo", 800, "g"), ("Bife de cuadril", 350, "g"), ("Solomillo de cerdo", 400, "g"), ("Carne magra", 200, "g"), ("Entrana", 400, "g")],
        7: [("Pechuga de pollo", 700, "g"), ("Carne en cubos magra", 400, "g"), ("Bifecitos de cerdo", 300, "g"), ("Vacio magro", 400, "g")],
        8: [("Pechuga de pollo", 700, "g"), ("Peceto", 400, "g"), ("Bife de lomo", 350, "g"), ("Matambre de cerdo", 400, "g")],
        9: [("Pechuga de pollo", 700, "g"), ("Bife angosto", 350, "g"), ("Entrana", 400, "g")],
        10: [("Pechuga de pollo", 800, "g"), ("Bifecitos de cerdo", 300, "g"), ("Vacio magro", 400, "g")],
        11: [("Pechuga de pollo", 800, "g"), ("Bife de chorizo", 350, "g"), ("Tira de asado", 500, "g")],
        12: [("Pechuga de pollo", 700, "g"), ("Lomo", 350, "g"), ("Entrana", 400, "g"), ("Carne picada magra", 250, "g")],
        13: [("Pechuga de pollo", 700, "g"), ("Bife angosto", 350, "g"), ("Vacio magro", 400, "g")],
        14: [("Pechuga de pollo", 700, "g"), ("Carne para carpaccio", 250, "g"), ("Lomo", 350, "g"), ("Costillas de cerdo", 500, "g")],
        15: [("Pechuga de pollo", 800, "g"), ("Bife angosto", 350, "g"), ("Entrana", 400, "g")],
        16: [("Pechuga de pollo", 700, "g"), ("Bifecitos de cerdo", 300, "g"), ("Vacio magro", 400, "g")],
    }

    generic_dairy = [
        ("Huevos", 24, "unid"),
        ("Queso port salut o de cabra", 200, "g"),
        ("Queso crema", 200, "g"),
        ("Queso rallado / parmesano", 150, "g"),
    ]

    generic_produce = [
        ("Rucula", 2, "bandejas"),
        ("Lechuga", 2, "unid"),
        ("Espinaca", 2, "atados"),
        ("Tomate", 8, "unid"),
        ("Tomate cherry", 1, "bandeja"),
        ("Palta", 4, "unid"),
        ("Cebolla", 4, "unid"),
        ("Zanahoria", 4, "unid"),
        ("Pepino", 2, "unid"),
        ("Limones", 5, "unid"),
        ("Morron", 2, "unid"),
    ]

    generic_extra_produce = {
        3: [("Hinojo", 1, "unid"), ("Naranja", 2, "unid"), ("Coliflor", 1, "unid"), ("Berenjena", 2, "unid"), ("Calabaza", 400, "g"), ("Apio", 1, "unid"), ("Cebolla morada", 1, "unid"), ("Cilantro", 1, "atado")],
        4: [("Brocoli", 2, "unid"), ("Zapallo anco", 1, "unid"), ("Esparragos", 1, "atado"), ("Zucchini", 2, "unid"), ("Berenjena", 1, "unid"), ("Cebolla morada", 1, "unid")],
        5: [("Zapallo", 500, "g"), ("Calabaza", 500, "g"), ("Coliflor", 1, "unid"), ("Choclo desgranado", 1, "lata"), ("Chauchas", 200, "g"), ("Repollo", 1, "unid"), ("Zapallito", 3, "unid"), ("Puerro", 1, "unid"), ("Apio", 1, "unid")],
        6: [("Calabaza", 500, "g"), ("Coliflor", 1, "unid"), ("Zapallo", 400, "g"), ("Zapallito", 2, "unid"), ("Puerro", 2, "unid"), ("Champignones", 1, "bandeja"), ("Cebolla de verdeo", 1, "atado"), ("Chauchas", 200, "g"), ("Porotos", 100, "g"), ("Jengibre", 1, "trozo"), ("Curcuma", 1, "sobre"), ("Albahaca", 1, "planta")],
        7: [("Brocoli", 1, "unid"), ("Zapallo", 500, "g"), ("Choclo desgranado", 1, "lata"), ("Hinojo", 1, "unid"), ("Zucchini", 2, "unid"), ("Zapallitos", 4, "unid"), ("Calabaza", 400, "g"), ("Puerro", 1, "unid"), ("Repollo colorado", 1, "unid"), ("Cebolla de verdeo", 1, "atado"), ("Lentejas", 100, "g")],
        8: [("Brocoli", 1, "unid"), ("Zapallo", 500, "g"), ("Zapallitos", 4, "unid"), ("Coliflor", 1, "unid"), ("Esparragos", 1, "atado"), ("Repollo blanco", 1, "unid"), ("Naranja", 2, "unid"), ("Jengibre", 1, "trozo"), ("Puerro", 1, "unid"), ("Choclo desgranado", 1, "lata"), ("Tomate seco", 50, "g"), ("Albahaca", 1, "planta"), ("Romero fresco", 1, "atado")],
        9: [("Brocoli", 1, "unid"), ("Coliflor", 1, "unid"), ("Calabaza", 400, "g"), ("Zapallitos", 3, "unid"), ("Remolacha", 2, "unid"), ("Cebolla morada", 1, "unid"), ("Cilantro", 1, "atado"), ("Ricota", 200, "g")],
        10: [("Esparragos", 2, "atados"), ("Champignones", 1, "bandeja"), ("Cebolla de verdeo", 1, "atado"), ("Brocoli", 1, "unid"), ("Berenjena", 2, "unid"), ("Zucchini", 2, "unid"), ("Muzzarella fresca", 150, "g"), ("Tomate seco", 50, "g"), ("Albahaca", 1, "planta"), ("Yogur natural", 200, "g"), ("Menta fresca", 1, "atado")],
        11: [("Esparragos", 1, "atado"), ("Hinojo", 1, "unid"), ("Naranja", 2, "unid"), ("Apio", 1, "unid"), ("Berenjena", 1, "unid"), ("Zucchini", 2, "unid"), ("Rabanitos", 1, "atado"), ("Cebolla morada", 1, "unid"), ("Cilantro", 1, "atado"), ("Alcaparras", 1, "frasco chico")],
        12: [("Brocoli", 2, "unid"), ("Coliflor", 1, "unid"), ("Champignones", 1, "bandeja"), ("Esparragos", 1, "atado"), ("Zapallitos", 3, "unid"), ("Chauchas", 200, "g"), ("Rabanitos", 1, "atado"), ("Eneldo", 1, "atado"), ("Albahaca", 1, "planta")],
        13: [("Mango", 1, "unid"), ("Cebolla morada", 2, "unid"), ("Cilantro", 1, "atado"), ("Muzzarella fresca", 150, "g"), ("Albahaca", 1, "planta"), ("Chauchas", 200, "g"), ("Eneldo", 1, "atado"), ("Alcaparras", 1, "frasco chico"), ("Queso feta", 150, "g"), ("Arvejas", 200, "g"), ("Mayonesa light", 1, "pote")],
        14: [("Apio", 2, "unid"), ("Berenjena", 1, "unid"), ("Zapallito", 2, "unid"), ("Naranja", 2, "unid"), ("Cebolla morada", 1, "unid"), ("Cebolla de verdeo", 1, "atado"), ("Coliflor", 1, "unid"), ("Puerro", 1, "unid"), ("Alcaparras", 1, "frasco"), ("Albahaca", 1, "planta"), ("Romero", 1, "atado")],
        15: [("Brocoli", 1, "unid"), ("Coliflor", 1, "unid"), ("Berenjena", 2, "unid"), ("Hinojo", 1, "unid"), ("Naranja", 1, "unid"), ("Rabanitos", 1, "atado"), ("Eneldo", 1, "atado"), ("Zucchini", 1, "unid"), ("Apio", 1, "unid"), ("Albahaca", 1, "planta")],
        16: [("Cebolla de verdeo", 1, "atado"), ("Chauchas", 200, "g"), ("Repollo", 1, "unid"), ("Muzzarella fresca", 150, "g"), ("Albahaca", 1, "planta"), ("Cilantro", 1, "atado"), ("Menta fresca", 1, "atado")],
    }

    generic_dietetica = [
        ("Nueces", 150, "g"),
        ("Almendras", 150, "g"),
        ("Semillas de girasol", 80, "g"),
        ("Semillas de chia", 80, "g"),
        ("Semillas de lino", 80, "g"),
    ]

    if week_num in specific:
        result = dict(base)
        for cat, items in specific[week_num].items():
            result[cat] = items
        return result

    result = dict(base)
    result["Pescaderia / Latas"] = generic_fish_weeks.get(week_num, [])
    result["Carniceria"] = generic_meat_weeks.get(week_num, [])
    result["Huevos y Lacteos"] = list(generic_dairy)
    result["Verduleria"] = list(generic_produce) + generic_extra_produce.get(week_num, [])
    result["Dietetica"] = list(generic_dietetica)

    return result


def format_date_es(d):
    return f"{d.day} {MONTH_NAMES_ES[d.month]} {d.year}"


def format_qty(qty, unit, mult):
    scaled = qty * mult
    if unit in ("unid", "bandejas", "atados", "atado", "frasco", "frasco chico", "sobre", "planta", "bandeja", "lata", "trozo", "pote", "botella chica"):
        scaled = math.ceil(scaled)
        return f"{scaled} {unit}"
    elif unit == "g":
        scaled = math.ceil(scaled / 50) * 50
        if scaled >= 1000:
            return f"{scaled/1000:.1f} kg"
        return f"{int(scaled)} g"
    elif unit == "ml":
        scaled = math.ceil(scaled / 100) * 100
        if scaled >= 1000:
            return f"{scaled/1000:.1f} L"
        return f"{int(scaled)} ml"
    elif unit == "litros":
        return f"{math.ceil(scaled)} litros"
    else:
        return f"{math.ceil(scaled)} {unit}"


def build_pdf(output_path):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        topMargin=1.5*cm,
        bottomMargin=1.5*cm,
        leftMargin=1.5*cm,
        rightMargin=1.5*cm,
    )

    styles = getSampleStyleSheet()

    s_title = ParagraphStyle("Title2", parent=styles["Title"], fontSize=22, textColor=C_BLACK, spaceAfter=4*mm)
    s_subtitle = ParagraphStyle("Subtitle2", parent=styles["Normal"], fontSize=11, textColor=C_GRAY, spaceAfter=6*mm)
    s_h1 = ParagraphStyle("H1", parent=styles["Heading1"], fontSize=16, textColor=C_HEADER_BG, spaceBefore=4*mm, spaceAfter=3*mm)
    s_h2 = ParagraphStyle("H2", parent=styles["Heading2"], fontSize=13, textColor=C_BRAND, spaceBefore=3*mm, spaceAfter=2*mm)
    s_h3 = ParagraphStyle("H3", parent=styles["Heading3"], fontSize=11, textColor=C_BLACK, spaceBefore=2*mm, spaceAfter=1*mm)
    s_body = ParagraphStyle("Body2", parent=styles["Normal"], fontSize=9, textColor=C_BLACK, leading=12)
    s_small = ParagraphStyle("Small2", parent=styles["Normal"], fontSize=8, textColor=C_GRAY, leading=10)
    s_meal_name = ParagraphStyle("MealName", parent=styles["Normal"], fontSize=9, textColor=C_BLACK, fontName="Helvetica-Bold", leading=12)
    s_meal_desc = ParagraphStyle("MealDesc", parent=styles["Normal"], fontSize=8, textColor=C_GRAY, leading=10)
    s_center = ParagraphStyle("Center2", parent=styles["Normal"], fontSize=10, alignment=TA_CENTER, textColor=C_GRAY)

    elements = []

    # ── Cover page ──
    elements.append(Spacer(1, 4*cm))
    elements.append(Paragraph("Plan de Comidas", s_title))
    elements.append(Paragraph("Dieta Mediterranea-Keto con Ayuno Intermitente 16:8", s_subtitle))
    elements.append(Spacer(1, 1*cm))
    elements.append(Paragraph(f"Periodo: {format_date_es(START_DATE)} - {format_date_es(END_DATE)}", s_body))
    elements.append(Paragraph(f"Porciones: 3 adultos + 1 nino ({PORTIONS}x)", s_body))
    elements.append(Paragraph("16 templates semanales rotativos por estacion", s_body))
    elements.append(Spacer(1, 5*mm))
    elements.append(Paragraph("Restricciones: Sin pan - Minimo arroz - Sin azucar agregada", s_body))
    elements.append(Paragraph("Pimienta en vez de sal - Solo agua + jugo exprimido 1-2x/sem", s_body))
    elements.append(Paragraph("Fuerte en pescado y frutos secos - Minimo ultraprocesados", s_body))
    elements.append(Paragraph("Ventana alimentacion: 12:30 - 19:00 (no desayuno)", s_body))
    elements.append(Spacer(1, 2*cm))

    # Calendar overview
    elements.append(Paragraph("Calendario: Que template usar cada semana", s_h2))
    elements.append(Spacer(1, 2*mm))

    cal_data = [["Semana", "Desde", "Hasta", "Template", "Estacion"]]
    current = START_DATE
    week_count = 0
    while current <= END_DATE:
        week_end = current + timedelta(days=6)
        template_idx = week_count % len(WEEKS)
        template = WEEKS[template_idx]
        cal_data.append([
            str(week_count + 1),
            f"{current.day}/{current.month}/{current.year}",
            f"{min(week_end, END_DATE).day}/{min(week_end, END_DATE).month}/{min(week_end, END_DATE).year}",
            f"Semana {template['num']}",
            SEASON_LABELS[template["season"]],
        ])
        current += timedelta(days=7)
        week_count += 1

    col_widths_cal = [45, 75, 75, 70, 70]
    cal_table = Table(cal_data, colWidths=col_widths_cal, repeatRows=1)
    cal_style = TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), C_HEADER_BG),
        ("TEXTCOLOR", (0, 0), (-1, 0), C_WHITE),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 7),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("GRID", (0, 0), (-1, -1), 0.5, C_BORDER),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [C_WHITE, C_ROW_ALT]),
        ("TOPPADDING", (0, 0), (-1, -1), 2),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
    ])
    cal_table.setStyle(cal_style)
    elements.append(cal_table)
    elements.append(PageBreak())

    # ── Weekly meal plans ──
    for week_template in WEEKS:
        wn = week_template["num"]
        season = SEASON_LABELS[week_template["season"]]

        # Find all calendar weeks that use this template
        applies_to = []
        current = START_DATE
        wc = 0
        while current <= END_DATE:
            if wc % len(WEEKS) == (wn - 1):
                week_end = current + timedelta(days=6)
                applies_to.append(f"{current.day}/{current.month}/{current.year} - {min(week_end, END_DATE).day}/{min(week_end, END_DATE).month}/{min(week_end, END_DATE).year}")
            current += timedelta(days=7)
            wc += 1

        elements.append(Paragraph(f"SEMANA {wn} - {season}", s_h1))
        applies_text = " | ".join(applies_to)
        elements.append(Paragraph(f"<b>Aplica a:</b> {applies_text}", s_small))
        elements.append(Spacer(1, 3*mm))

        # Meals table
        meal_data = [["Dia", "Almuerzo (12:30)", "Cena (19:00)", "Snack (16:00)", "Cal. total"]]

        for i, day_data in enumerate(week_template["days"]):
            lunch = day_data["lunch"]
            dinner = day_data["dinner"]
            snack = day_data["snack"]
            total_cal = lunch["cal"] + dinner["cal"] + snack["cal"]

            lunch_text = f"<b>{lunch['name']}</b><br/><font size=7 color='#64748b'>{lunch['desc']}</font><br/><font size=7 color='#3b82f6'>{lunch['cal']} kcal</font>"
            dinner_text = f"<b>{dinner['name']}</b><br/><font size=7 color='#64748b'>{dinner['desc']}</font><br/><font size=7 color='#3b82f6'>{dinner['cal']} kcal</font>"
            snack_text = f"{snack['name']}<br/><font size=7 color='#64748b'>{snack['desc']}</font><br/><font size=7 color='#3b82f6'>{snack['cal']} kcal</font>"

            meal_data.append([
                DAY_NAMES_ES[i],
                Paragraph(lunch_text, s_body),
                Paragraph(dinner_text, s_body),
                Paragraph(snack_text, s_small),
                f"{total_cal}",
            ])

        col_widths_meal = [55, 155, 155, 105, 40]
        meal_table = Table(meal_data, colWidths=col_widths_meal, repeatRows=1)
        meal_table_style = TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), C_HEADER_BG),
            ("TEXTCOLOR", (0, 0), (-1, 0), C_WHITE),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, 0), 8),
            ("FONTSIZE", (0, 1), (0, -1), 8),
            ("FONTSIZE", (-1, 1), (-1, -1), 8),
            ("FONTNAME", (0, 1), (0, -1), "Helvetica-Bold"),
            ("ALIGN", (0, 0), (0, -1), "CENTER"),
            ("ALIGN", (-1, 0), (-1, -1), "CENTER"),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("GRID", (0, 0), (-1, -1), 0.5, C_BORDER),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [C_WHITE, C_LIGHT_GRAY]),
            ("TOPPADDING", (0, 1), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 1), (-1, -1), 4),
            ("LEFTPADDING", (0, 0), (-1, -1), 4),
            ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ])
        meal_table.setStyle(meal_table_style)
        elements.append(meal_table)
        elements.append(Spacer(1, 6*mm))

        # Shopping list
        elements.append(Paragraph(f"Lista de compras - Semana {wn} (para {PORTIONS:.0f} porciones: 3 adultos + 1 nino)", s_h2))
        elements.append(Paragraph("Comprar el domingo para toda la semana", s_small))
        elements.append(Spacer(1, 2*mm))

        shopping = _shopping(wn)
        for category, items in shopping.items():
            if not items:
                continue
            shop_data = [[Paragraph(f"<b>{category}</b>", s_body), ""]]
            for item_name, qty, unit in items:
                shop_data.append([item_name, format_qty(qty, unit, PORTIONS)])

            shop_table = Table(shop_data, colWidths=[350, 140])
            shop_style = TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), C_SECTION_BG),
                ("SPAN", (0, 0), (-1, 0)),
                ("FONTSIZE", (0, 0), (-1, -1), 8),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LINEBELOW", (0, 0), (-1, 0), 0.5, C_BRAND),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [C_WHITE, C_LIGHT_GRAY]),
                ("TOPPADDING", (0, 0), (-1, -1), 2),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
                ("LEFTPADDING", (0, 1), (0, -1), 12),
            ])
            shop_table.setStyle(shop_style)
            elements.append(shop_table)
            elements.append(Spacer(1, 1*mm))

        if wn < len(WEEKS):
            elements.append(PageBreak())

    doc.build(elements)
    return output_path


if __name__ == "__main__":
    out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "plan-de-comidas.pdf")
    build_pdf(out)
    print(f"PDF generado: {out}")
