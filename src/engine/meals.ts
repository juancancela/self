import type { WeekMealPlan, DayMealPlan, Meal } from './types';

function meal(time: string, name: string, description: string, calories_est: number, protein_g: number, fat_g: number, carbs_g: number, fiber_g: number): Meal {
  return { time, name, description, calories_est, macros: { protein_g, fat_g, carbs_g, fiber_g } };
}

function day(lunch: Meal, dinner: Meal, snack?: Meal): DayMealPlan {
  const meals = [lunch, dinner];
  const total = meals.reduce((s, m) => s + m.calories_est, 0) + (snack?.calories_est ?? 0);
  return { meals, total_calories: total, snack };
}

// ── Snack pool (all IF-16:8 friendly, within eating window) ──
const SNACKS: Meal[] = [
  meal('16:00', 'Nueces mixtas', '30g nueces + almendras de dietética', 190, 5, 17, 4, 2),
  meal('16:00', 'Queso con aceitunas', '2 fetas queso port salut + 6 aceitunas', 180, 10, 14, 2, 1),
  meal('16:00', 'Palta con limón', '½ palta con jugo de limón y pimienta', 160, 2, 15, 4, 5),
  meal('16:00', 'Huevo duro', '2 huevos duros con pimienta', 155, 13, 11, 1, 0),
  meal('16:00', 'Mix de semillas', '30g semillas de girasol, chía y lino de dietética', 170, 6, 14, 5, 4),
  meal('16:00', 'Bastones de pepino con queso crema', 'Pepino en bastones + 2 cdas queso crema', 110, 3, 9, 3, 1),
  meal('16:00', 'Tomates cherry con aceite de oliva', '10 cherry con aceite de oliva y orégano', 100, 2, 7, 5, 2),
];

// ── Week templates organized by season ──

const WEEK_TEMPLATES: WeekMealPlan[] = [
  // ══════════════════════════════════════
  // OTOÑO - Semanas 1-4
  // ══════════════════════════════════════
  {
    week_number: 1,
    season: 'autumn',
    days: {
      monday: day(
        meal('12:30', 'Merluza a la plancha con ensalada', 'Filet de merluza a la plancha con rúcula, tomate, palta y aceite de oliva', 520, 38, 30, 8, 4),
        meal('19:00', 'Omelette de espinaca y queso', '3 huevos con espinaca, queso port salut, pimienta', 450, 30, 32, 4, 2),
        SNACKS[0],
      ),
      tuesday: day(
        meal('12:30', 'Pollo grillado con brócoli', 'Pechuga de pollo a la plancha con brócoli al vapor y aceite de oliva', 480, 42, 22, 10, 5),
        meal('19:00', 'Ensalada de atún', 'Atún en lata al natural con lechuga, huevo duro, tomate, aceitunas y aceite de oliva', 420, 35, 25, 6, 3),
        SNACKS[1],
      ),
      wednesday: day(
        meal('12:30', 'Caballa con ensalada mixta', 'Caballa en lata con lechuga, zanahoria rallada, pepino y limón', 460, 32, 28, 8, 3),
        meal('19:00', 'Zapallitos rellenos con carne', 'Zapallitos rellenos con carne picada magra, cebolla, morrón y queso rallado', 490, 35, 28, 12, 4),
        SNACKS[4],
      ),
      thursday: day(
        meal('12:30', 'Revuelto de huevos con verduras', '3 huevos revueltos con champignones, espinaca y cebolla de verdeo', 430, 25, 30, 6, 3),
        meal('19:00', 'Merluza al horno con calabaza', 'Filet de merluza al horno con rodajas de calabaza y aceite de oliva', 460, 36, 22, 15, 4),
        SNACKS[2],
      ),
      friday: day(
        meal('12:30', 'Ensalada César sin pan', 'Lechuga, pechuga grillada, parmesano, huevo duro, aderezo de oliva y limón', 500, 40, 30, 6, 2),
        meal('19:00', 'Hamburguesas caseras sin pan', '2 hamburguesas de carne magra con lechuga, tomate, pepinillo y mostaza', 520, 42, 32, 8, 3),
        SNACKS[3],
      ),
      saturday: day(
        meal('12:30', 'Salmón rosado con palta', 'Salmón rosado en lata con palta, rúcula, tomate cherry y aceite de oliva', 540, 34, 36, 8, 5),
        meal('19:00', 'Pollo al horno con berenjena', 'Muslo de pollo al horno con berenjena grillada y aceite de oliva', 510, 38, 30, 10, 5),
        SNACKS[5],
      ),
      sunday: day(
        meal('12:30', 'Asado magro con ensalada', 'Entraña o vacío magro a la parrilla con ensalada de lechuga y tomate', 550, 45, 35, 5, 2),
        meal('19:00', 'Sopa de verduras con huevo', 'Sopa de zapallo, zanahoria, puerro con 2 huevos poché', 380, 18, 20, 18, 6),
        SNACKS[6],
      ),
    },
  },
  {
    week_number: 2,
    season: 'autumn',
    days: {
      monday: day(
        meal('12:30', 'Atún con palta y huevo', 'Atún al natural con palta, huevo duro, tomate y aceite de oliva', 510, 38, 32, 6, 4),
        meal('19:00', 'Milanesa de pollo al horno con ensalada', 'Milanesa de pollo al horno (rebozada con almendras molidas) con lechuga y tomate', 480, 40, 24, 10, 3),
        SNACKS[0],
      ),
      tuesday: day(
        meal('12:30', 'Pollo al verdeo con zapallitos', 'Pechuga fileteada con cebolla de verdeo, zapallitos salteados en aceite de oliva', 470, 40, 24, 8, 4),
        meal('19:00', 'Huevos a la florentina', '3 huevos poché sobre espinaca salteada con queso rallado', 420, 28, 30, 5, 3),
        SNACKS[2],
      ),
      wednesday: day(
        meal('12:30', 'Merluza con salsa de limón', 'Filet de merluza a la plancha con salsa de limón, alcaparras y ensalada', 450, 36, 24, 8, 3),
        meal('19:00', 'Wok de verduras con pollo', 'Pollo en tiritas con brócoli, morrón, cebolla y salsa de soja', 490, 38, 22, 14, 5),
        SNACKS[4],
      ),
      thursday: day(
        meal('12:30', 'Ensalada tibia de calabaza y queso', 'Calabaza asada, rúcula, queso de cabra, nueces y aceite de oliva', 480, 18, 34, 20, 6),
        meal('19:00', 'Bife angosto con ensalada', 'Bife angosto a la plancha con ensalada de rúcula, tomate cherry y parmesano', 520, 44, 32, 5, 2),
        SNACKS[1],
      ),
      friday: day(
        meal('12:30', 'Caballa con verduras grilladas', 'Caballa al horno con berenjena, morrón y zucchini grillados', 490, 34, 30, 10, 5),
        meal('19:00', 'Tortilla de espinaca y champignones', 'Tortilla de 3 huevos con espinaca, champignones y cebolla', 430, 26, 30, 6, 3),
        SNACKS[3],
      ),
      saturday: day(
        meal('12:30', 'Tarta sin masa de atún', 'Atún, huevos, queso crema, cebolla, morrón en budinera al horno', 500, 38, 32, 8, 2),
        meal('19:00', 'Pollo al limón con espárragos', 'Pechuga al horno con limón, espárragos y aceite de oliva', 440, 40, 22, 8, 4),
        SNACKS[5],
      ),
      sunday: day(
        meal('12:30', 'Matambre a la pizza sin masa', 'Fetas de matambre de cerdo con salsa de tomate, queso y orégano', 540, 40, 36, 8, 2),
        meal('19:00', 'Crema de calabaza', 'Crema de calabaza y puerro con semillas de girasol por encima', 350, 10, 18, 22, 6),
        SNACKS[6],
      ),
    },
  },
  {
    week_number: 3,
    season: 'autumn',
    days: {
      monday: day(
        meal('12:30', 'Trucha a la plancha', 'Trucha a la plancha con ensalada de hinojo, naranja y rúcula', 480, 38, 26, 10, 4),
        meal('19:00', 'Revuelto gramajo sin papas', 'Huevos revueltos con jamón natural, arvejas, cebolla y morrón', 460, 28, 30, 10, 4),
        SNACKS[0],
      ),
      tuesday: day(
        meal('12:30', 'Pollo con curry y coliflor', 'Pechuga en cubos con coliflor, curry, crema y cúrcuma', 510, 40, 28, 12, 4),
        meal('19:00', 'Ensalada de salmón rosado', 'Salmón rosado en lata, palta, pepino, semillas de sésamo, limón', 490, 32, 34, 6, 4),
        SNACKS[2],
      ),
      wednesday: day(
        meal('12:30', 'Milanesa de merluza al horno', 'Filet rebozado en almendras molidas al horno con ensalada de repollo', 470, 34, 26, 10, 4),
        meal('19:00', 'Berenjenas rellenas', 'Berenjenas rellenas con carne picada, tomate, cebolla y queso gratinado', 500, 32, 30, 14, 6),
        SNACKS[1],
      ),
      thursday: day(
        meal('12:30', 'Wrap de lechuga con pollo', 'Hojas de lechuga rellenas con pollo desmenuzado, palta, tomate y mostaza', 440, 36, 26, 8, 4),
        meal('19:00', 'Merluza al horno con tomate', 'Filet de merluza con rodajas de tomate, aceitunas, alcaparras y aceite', 430, 34, 22, 8, 3),
        SNACKS[4],
      ),
      friday: day(
        meal('12:30', 'Ensalada de pollo y nueces', 'Pollo grillado, nueces, palta, apio, lechuga, aderezo de limón', 520, 38, 34, 8, 5),
        meal('19:00', 'Tortilla de calabaza y queso', 'Tortilla de 3 huevos con calabaza asada y queso de cabra', 460, 26, 32, 12, 3),
        SNACKS[3],
      ),
      saturday: day(
        meal('12:30', 'Ceviche de merluza', 'Merluza marinada en limón con cebolla morada, cilantro, palta y ají', 380, 32, 18, 10, 4),
        meal('19:00', 'Pollo a la mostaza con espinaca', 'Pechuga al horno con mostaza, espinaca salteada con ajo', 470, 40, 26, 6, 3),
        SNACKS[5],
      ),
      sunday: day(
        meal('12:30', 'Asado de tira magro con ensalada', 'Tira de asado magra con ensalada mixta grande', 560, 44, 36, 5, 2),
        meal('19:00', 'Sopa de pollo y verduras', 'Caldo de pollo con zanahoria, apio, zapallito y espinaca', 360, 26, 16, 14, 5),
        SNACKS[6],
      ),
    },
  },
  {
    week_number: 4,
    season: 'autumn',
    days: {
      monday: day(
        meal('12:30', 'Atún con ensalada mediterránea', 'Atún al natural con tomate, pepino, aceitunas negras, cebolla morada y aceite de oliva', 470, 36, 28, 8, 4),
        meal('19:00', 'Pollo al pimentón con brócoli', 'Pechuga al horno con pimentón ahumado, brócoli al vapor', 460, 40, 22, 10, 5),
        SNACKS[0],
      ),
      tuesday: day(
        meal('12:30', 'Ensalada de caballa y huevo', 'Caballa en lata, 2 huevos duros, lechuga, tomate cherry, aceite de oliva', 500, 38, 32, 6, 3),
        meal('19:00', 'Zapallo anco relleno', 'Zapallo anco relleno con carne, cebolla, queso y especias', 480, 30, 26, 18, 6),
        SNACKS[2],
      ),
      wednesday: day(
        meal('12:30', 'Bowl de pollo y palta', 'Pollo desmenuzado, palta, tomate, pepino, semillas de chía, limón', 510, 38, 32, 8, 6),
        meal('19:00', 'Merluza en papillote', 'Filet de merluza al horno en papel aluminio con cebolla, morrón y limón', 400, 34, 18, 8, 3),
        SNACKS[4],
      ),
      thursday: day(
        meal('12:30', 'Revuelto de espárragos y queso', '3 huevos revueltos con espárragos, queso de cabra y pimienta', 440, 28, 32, 6, 3),
        meal('19:00', 'Bife de chorizo con ensalada', 'Bife de chorizo magro a la plancha con ensalada de rúcula y parmesano', 530, 44, 34, 4, 2),
        SNACKS[1],
      ),
      friday: day(
        meal('12:30', 'Salmón con vegetales asados', 'Salmón rosado al horno con zucchini, berenjena y morrón asados', 500, 34, 30, 12, 5),
        meal('19:00', 'Huevos rellenos con atún', '4 mitades de huevo rellenas con atún, mayonesa light y ensalada verde', 420, 30, 28, 4, 2),
        SNACKS[3],
      ),
      saturday: day(
        meal('12:30', 'Pollo a las finas hierbas', 'Pechuga al horno con romero, tomillo, ajo y ensalada de tomate y cebolla', 470, 42, 24, 6, 3),
        meal('19:00', 'Tarta sin masa de verduras', 'Espinaca, brócoli, huevos, queso crema en budinera al horno', 430, 24, 30, 10, 5),
        SNACKS[5],
      ),
      sunday: day(
        meal('12:30', 'Vacío a la parrilla con chimichurri', 'Vacío magro con chimichurri casero y ensalada mixta', 560, 46, 36, 4, 2),
        meal('19:00', 'Crema de brócoli con queso', 'Crema de brócoli con queso port salut y semillas', 380, 16, 24, 14, 6),
        SNACKS[6],
      ),
    },
  },

  // ══════════════════════════════════════
  // INVIERNO - Semanas 5-8
  // ══════════════════════════════════════
  {
    week_number: 5,
    season: 'winter',
    days: {
      monday: day(
        meal('12:30', 'Guiso de pollo liviano', 'Pollo con zapallo, zanahoria, cebolla, pimentón (sin papa ni fideos)', 490, 38, 22, 18, 6),
        meal('19:00', 'Omelette de jamón y queso', '3 huevos con jamón natural y queso port salut', 440, 32, 30, 3, 1),
        SNACKS[0],
      ),
      tuesday: day(
        meal('12:30', 'Merluza con salsa provenzal', 'Filet al horno con ajo, perejil, aceite de oliva y ensalada', 460, 36, 26, 6, 3),
        meal('19:00', 'Sopa crema de calabaza con pollo', 'Crema de calabaza con trozos de pollo y semillas de girasol', 470, 30, 24, 20, 5),
        SNACKS[2],
      ),
      wednesday: day(
        meal('12:30', 'Pollo al escabeche casero', 'Pechuga en escabeche con zanahoria, cebolla, laurel y vinagre', 480, 40, 26, 10, 3),
        meal('19:00', 'Tortilla de coliflor', '3 huevos con coliflor, cebolla y queso rallado', 420, 26, 28, 10, 4),
        SNACKS[4],
      ),
      thursday: day(
        meal('12:30', 'Estofado de carne liviano', 'Carne magra con zapallo, choclo desgranado, tomate (sin papa)', 520, 40, 26, 18, 5),
        meal('19:00', 'Ensalada tibia de atún', 'Atún al natural con chauchas hervidas, huevo, tomate, aceite de oliva', 440, 34, 26, 8, 4),
        SNACKS[1],
      ),
      friday: day(
        meal('12:30', 'Caballa al horno con verduras', 'Caballa fresca al horno con cebolla, morrón y tomate', 470, 34, 28, 10, 4),
        meal('19:00', 'Budín de espinaca y queso', 'Espinaca, huevos, queso crema, nuez moscada al horno', 430, 24, 30, 8, 4),
        SNACKS[3],
      ),
      saturday: day(
        meal('12:30', 'Bondiola al horno con ensalada', 'Bondiola magra asada con ensalada de repollo y zanahoria', 540, 40, 34, 8, 4),
        meal('19:00', 'Crema de puerro y apio', 'Crema de puerro con apio, cebolla y queso rallado', 350, 12, 20, 16, 5),
        SNACKS[5],
      ),
      sunday: day(
        meal('12:30', 'Costillas de cerdo al horno', 'Costillitas al horno con pimentón, ajo y ensalada', 570, 42, 38, 6, 2),
        meal('19:00', 'Sopa de verduras con huevo', 'Sopa de zapallito, zanahoria, espinaca con 2 huevos', 370, 18, 20, 14, 6),
        SNACKS[6],
      ),
    },
  },
  {
    week_number: 6,
    season: 'winter',
    days: {
      monday: day(
        meal('12:30', 'Cazuela de merluza', 'Merluza con caldo, zanahoria, puerro, zapallito y pimienta', 440, 36, 20, 12, 4),
        meal('19:00', 'Revuelto de champignones y queso', '3 huevos con champignones, cebolla de verdeo y queso de cabra', 450, 28, 32, 5, 2),
        SNACKS[0],
      ),
      tuesday: day(
        meal('12:30', 'Pollo al curry con coliflor', 'Muslo de pollo deshuesado con coliflor, curry, crema liviana', 510, 38, 30, 12, 4),
        meal('19:00', 'Tarta sin masa de atún y morrón', 'Atún, huevos, queso crema, morrón asado en budinera', 460, 34, 28, 8, 2),
        SNACKS[2],
      ),
      wednesday: day(
        meal('12:30', 'Bife a la criolla', 'Bife de cuadril con salsa de tomate, cebolla, morrón y huevo frito', 530, 42, 32, 10, 3),
        meal('19:00', 'Ensalada de huevo y palta', '3 huevos duros, palta, rúcula, tomate cherry, aceite de oliva', 460, 22, 36, 8, 5),
        SNACKS[4],
      ),
      thursday: day(
        meal('12:30', 'Atún al horno con vegetales', 'Atún fresco o en lata al horno con cebolla, tomate y aceitunas', 480, 38, 28, 8, 3),
        meal('19:00', 'Locro liviano', 'Zapallo, porotos (porción chica), carne magra, cebolla de verdeo', 470, 30, 20, 24, 8),
        SNACKS[1],
      ),
      friday: day(
        meal('12:30', 'Pollo grillado con rúcula y parmesano', 'Pechuga grillada sobre rúcula con parmesano en escamas y limón', 480, 42, 28, 4, 2),
        meal('19:00', 'Merluza con puré de coliflor', 'Filet a la plancha con puré de coliflor con queso crema', 430, 34, 22, 12, 4),
        SNACKS[3],
      ),
      saturday: day(
        meal('12:30', 'Cerdo a la mostaza con zapallo', 'Solomillo de cerdo al horno con mostaza y zapallo asado', 530, 40, 30, 16, 4),
        meal('19:00', 'Sopa de tomate y albahaca', 'Sopa de tomate casera con albahaca, aceite de oliva y queso', 340, 10, 18, 18, 5),
        SNACKS[5],
      ),
      sunday: day(
        meal('12:30', 'Entraña a la parrilla', 'Entraña con chimichurri y ensalada de lechuga, tomate y cebolla', 550, 44, 36, 5, 2),
        meal('19:00', 'Crema de zanahoria y jengibre', 'Crema de zanahoria con jengibre, cúrcuma y semillas', 340, 8, 18, 20, 6),
        SNACKS[6],
      ),
    },
  },
  {
    week_number: 7,
    season: 'winter',
    days: {
      monday: day(
        meal('12:30', 'Carbonada liviana', 'Carne en cubos con zapallo, choclo, zanahoria (sin papa ni batata)', 510, 38, 24, 20, 5),
        meal('19:00', 'Tortilla de puerro y queso', '3 huevos con puerro salteado y queso rallado', 430, 26, 30, 6, 3),
        SNACKS[0],
      ),
      tuesday: day(
        meal('12:30', 'Merluza negra a la plancha', 'Merluza negra con ensalada de hinojo, rúcula y almendras', 470, 38, 26, 8, 4),
        meal('19:00', 'Pollo con vegetales al wok', 'Pollo en tiritas con brócoli, morrón, zucchini y salsa de soja', 480, 38, 22, 12, 5),
        SNACKS[2],
      ),
      wednesday: day(
        meal('12:30', 'Hamburguesas de atún caseras', '2 hamburguesas de atún con huevo, cebolla + ensalada', 460, 36, 26, 8, 3),
        meal('19:00', 'Zapallitos gratinados', 'Zapallitos rellenos con queso crema, cebolla y gratinados', 410, 18, 28, 12, 5),
        SNACKS[4],
      ),
      thursday: day(
        meal('12:30', 'Pollo al verdeo con puré de calabaza', 'Pechuga con cebolla de verdeo y puré de calabaza', 490, 40, 24, 16, 4),
        meal('19:00', 'Ensalada de caballa y legumbres', 'Caballa con porción chica de lentejas, tomate, cebolla, limón', 460, 32, 24, 16, 6),
        SNACKS[1],
      ),
      friday: day(
        meal('12:30', 'Bifecitos de cerdo con ensalada', 'Bifecitos de cerdo a la plancha con ensalada de repollo colorado', 500, 38, 30, 8, 4),
        meal('19:00', 'Huevos al horno con tomate', '3 huevos al horno en salsa de tomate con cebolla y morrón', 420, 22, 28, 12, 4),
        SNACKS[3],
      ),
      saturday: day(
        meal('12:30', 'Salmón rosado con ensalada', 'Salmón rosado en lata con palta, pepino, semillas y limón', 510, 32, 34, 8, 5),
        meal('19:00', 'Guiso de pollo y verduras', 'Pollo con zapallo, zanahoria, cebolla (sin papa ni fideos)', 470, 36, 22, 16, 5),
        SNACKS[5],
      ),
      sunday: day(
        meal('12:30', 'Asado de vacío con chimichurri', 'Vacío magro a la parrilla con chimichurri y ensalada mixta', 560, 46, 36, 4, 2),
        meal('19:00', 'Sopa crema de espinaca', 'Crema de espinaca con queso crema y nuez moscada', 360, 14, 24, 12, 5),
        SNACKS[6],
      ),
    },
  },
  {
    week_number: 8,
    season: 'winter',
    days: {
      monday: day(
        meal('12:30', 'Peceto al horno con vegetales', 'Peceto con zanahoria, cebolla, zapallo al horno', 500, 42, 24, 14, 4),
        meal('19:00', 'Omelette de queso y tomate', '3 huevos con queso de cabra, tomate seco y albahaca', 440, 28, 32, 5, 2),
        SNACKS[0],
      ),
      tuesday: day(
        meal('12:30', 'Merluza con almendras', 'Filet al horno con costra de almendras molidas y ensalada', 490, 38, 30, 8, 4),
        meal('19:00', 'Ensalada tibia de pollo', 'Pollo grillado con zapallitos asados, rúcula y parmesano', 470, 40, 26, 8, 3),
        SNACKS[2],
      ),
      wednesday: day(
        meal('12:30', 'Caballa con puré de coliflor', 'Caballa al horno con puré de coliflor y aceite de oliva', 460, 34, 28, 10, 4),
        meal('19:00', 'Budín de zapallitos', 'Zapallitos rallados, huevos, queso rallado y cebolla al horno', 400, 22, 26, 12, 5),
        SNACKS[4],
      ),
      thursday: day(
        meal('12:30', 'Pollo a la naranja liviano', 'Pechuga con jugo de naranja, jengibre y brócoli al vapor', 480, 40, 22, 14, 4),
        meal('19:00', 'Atún con ensalada de repollo', 'Atún al natural con repollo blanco, zanahoria rallada y limón', 410, 34, 22, 8, 4),
        SNACKS[1],
      ),
      friday: day(
        meal('12:30', 'Bife de lomo con espárragos', 'Lomo a la plancha con espárragos grillados y aceite de oliva', 500, 44, 30, 6, 3),
        meal('19:00', 'Tortilla de verduras mixta', '3 huevos con espinaca, cebolla, morrón y queso', 440, 28, 30, 8, 4),
        SNACKS[3],
      ),
      saturday: day(
        meal('12:30', 'Trucha al horno con hierbas', 'Trucha con romero, limón, ajo y ensalada verde', 480, 38, 28, 6, 3),
        meal('19:00', 'Crema de zapallo y puerro', 'Crema de zapallo con puerro, queso crema y semillas', 370, 12, 22, 18, 5),
        SNACKS[5],
      ),
      sunday: day(
        meal('12:30', 'Matambre de cerdo al horno', 'Matambre tiernizado al horno con ensalada fresca', 550, 40, 36, 6, 2),
        meal('19:00', 'Sopa de verduras abundante', 'Sopa de zapallito, choclo desgranado, espinaca y cebolla', 340, 12, 14, 20, 7),
        SNACKS[6],
      ),
    },
  },

  // ══════════════════════════════════════
  // PRIMAVERA - Semanas 9-12
  // ══════════════════════════════════════
  {
    week_number: 9,
    season: 'spring',
    days: {
      monday: day(
        meal('12:30', 'Ensalada de salmón y palta', 'Salmón rosado con palta, rúcula, pepino, semillas de sésamo', 520, 34, 36, 8, 5),
        meal('19:00', 'Pollo a la plancha con ensalada fresca', 'Pechuga con lechuga, tomate, zanahoria rallada y aceite de oliva', 440, 40, 22, 8, 4),
        SNACKS[0],
      ),
      tuesday: day(
        meal('12:30', 'Merluza con taboulé de coliflor', 'Filet a la plancha con coliflor procesada, perejil, tomate, limón', 450, 36, 22, 12, 5),
        meal('19:00', 'Huevos rancheros sin tortilla', '3 huevos fritos en salsa de tomate con cebolla, morrón y cilantro', 430, 22, 28, 12, 4),
        SNACKS[2],
      ),
      wednesday: day(
        meal('12:30', 'Pollo con ensalada griega', 'Pechuga grillada con pepino, tomate, aceitunas, queso feta y orégano', 500, 42, 28, 8, 3),
        meal('19:00', 'Caballa con ensalada de remolacha', 'Caballa con remolacha rallada, huevo duro y cebolla morada', 450, 32, 26, 12, 4),
        SNACKS[4],
      ),
      thursday: day(
        meal('12:30', 'Bowl de atún y verduras', 'Atún al natural con palta, pepino, zanahoria, semillas de chía', 480, 36, 30, 8, 6),
        meal('19:00', 'Zapallitos a la provenzal con huevo', 'Zapallitos salteados con ajo, perejil y 2 huevos fritos', 400, 20, 28, 10, 5),
        SNACKS[1],
      ),
      friday: day(
        meal('12:30', 'Bife con chimichurri y verduras', 'Bife angosto con chimichurri y verduras grilladas', 530, 44, 34, 6, 3),
        meal('19:00', 'Ensalada tibia de pollo y calabaza', 'Pollo grillado con calabaza asada, rúcula y semillas', 460, 36, 26, 14, 4),
        SNACKS[3],
      ),
      saturday: day(
        meal('12:30', 'Trucha con almendras', 'Trucha a la plancha con almendras tostadas y ensalada verde', 510, 38, 32, 6, 3),
        meal('19:00', 'Tarta sin masa de espinaca', 'Espinaca, ricota, huevos, nuez moscada al horno', 420, 24, 28, 10, 5),
        SNACKS[5],
      ),
      sunday: day(
        meal('12:30', 'Asado de entraña con ensalada', 'Entraña a la parrilla con ensalada de lechuga, tomate y cebolla', 550, 44, 36, 5, 2),
        meal('19:00', 'Gazpacho con huevo', 'Gazpacho frío de tomate, pepino, morrón con huevo duro picado', 320, 14, 16, 16, 5),
        SNACKS[6],
      ),
    },
  },
  {
    week_number: 10,
    season: 'spring',
    days: {
      monday: day(
        meal('12:30', 'Merluza a la vasca', 'Merluza con salsa de perejil, ajo, arvejas y espárragos', 460, 36, 24, 10, 4),
        meal('19:00', 'Revuelto de espárragos y champignones', '3 huevos con espárragos, champignones y cebolla de verdeo', 420, 24, 30, 6, 3),
        SNACKS[0],
      ),
      tuesday: day(
        meal('12:30', 'Pollo con pesto de rúcula', 'Pechuga grillada con pesto de rúcula y nueces, tomate cherry', 510, 40, 30, 8, 3),
        meal('19:00', 'Ensalada de caballa y huevo', 'Caballa, 2 huevos duros, lechuga, pepino, aceite de oliva', 460, 34, 28, 6, 3),
        SNACKS[2],
      ),
      wednesday: day(
        meal('12:30', 'Salmón con vegetales salteados', 'Salmón rosado con zucchini, berenjena y morrón salteados', 520, 34, 32, 12, 5),
        meal('19:00', 'Omelette de espinaca y tomate seco', '3 huevos con espinaca y tomate seco rehidratado', 430, 26, 30, 6, 3),
        SNACKS[4],
      ),
      thursday: day(
        meal('12:30', 'Atún con ensalada caprese', 'Atún al natural con tomate, muzzarella fresca, albahaca y aceite', 490, 38, 30, 8, 2),
        meal('19:00', 'Pollo al limón con espárragos', 'Pechuga al horno con limón y espárragos grillados', 440, 40, 22, 8, 4),
        SNACKS[1],
      ),
      friday: day(
        meal('12:30', 'Cerdo a la provenzal con brócoli', 'Bifecitos de cerdo con ajo, perejil y brócoli al vapor', 500, 38, 30, 10, 5),
        meal('19:00', 'Berenjenas a la napolitana', 'Berenjenas grilladas con salsa de tomate y queso gratinado', 420, 18, 26, 16, 6),
        SNACKS[3],
      ),
      saturday: day(
        meal('12:30', 'Bowl mediterráneo de pescado', 'Merluza grillada con aceitunas, tomate, pepino, palta y limón', 490, 36, 30, 10, 5),
        meal('19:00', 'Huevos al horno con espinaca', '3 huevos al horno sobre espinaca con queso de cabra', 440, 28, 32, 5, 3),
        SNACKS[5],
      ),
      sunday: day(
        meal('12:30', 'Vacío a la parrilla primaveral', 'Vacío magro con ensalada de rúcula, parmesano y limón', 550, 46, 36, 4, 2),
        meal('19:00', 'Sopa fría de pepino y menta', 'Pepino, yogur natural, menta, limón y aceite de oliva', 280, 8, 16, 14, 3),
        SNACKS[6],
      ),
    },
  },
  {
    week_number: 11,
    season: 'spring',
    days: {
      monday: day(
        meal('12:30', 'Trucha con ensalada primaveral', 'Trucha a la plancha con rúcula, rabanitos, pepino y nueces', 490, 38, 28, 8, 4),
        meal('19:00', 'Tortilla de espárragos y queso', '3 huevos con espárragos y queso de cabra', 430, 26, 30, 6, 3),
        SNACKS[0],
      ),
      tuesday: day(
        meal('12:30', 'Pollo mediterráneo', 'Pechuga al horno con tomate cherry, aceitunas, alcaparras y orégano', 480, 42, 24, 8, 3),
        meal('19:00', 'Merluza con ensalada de hinojo', 'Filet a la plancha con hinojo, naranja y rúcula', 430, 34, 22, 10, 4),
        SNACKS[2],
      ),
      wednesday: day(
        meal('12:30', 'Ensalada de pollo y frutos secos', 'Pollo grillado con almendras, nueces, apio, lechuga y mostaza', 520, 38, 34, 8, 5),
        meal('19:00', 'Budín de verduras mixtas', 'Zucchini, zanahoria, huevos, queso y cebolla al horno', 410, 22, 26, 14, 5),
        SNACKS[4],
      ),
      thursday: day(
        meal('12:30', 'Caballa con vegetales a la plancha', 'Caballa con berenjena, zucchini y morrón grillados', 480, 34, 30, 10, 5),
        meal('19:00', 'Revuelto de tomate y cebolla', '3 huevos con tomate, cebolla caramelizada y pimienta', 400, 22, 28, 8, 3),
        SNACKS[1],
      ),
      friday: day(
        meal('12:30', 'Bife con ensalada de rúcula y palta', 'Bife de chorizo con rúcula, palta, tomate cherry y limón', 540, 42, 36, 6, 4),
        meal('19:00', 'Merluza al limón con espinaca', 'Filet con limón y espinaca salteada con ajo', 420, 36, 20, 6, 3),
        SNACKS[3],
      ),
      saturday: day(
        meal('12:30', 'Ceviche de merluza primaveral', 'Merluza en limón con cebolla morada, cilantro, palta y ají', 380, 32, 18, 10, 4),
        meal('19:00', 'Pollo relleno de espinaca', 'Pechuga rellena con espinaca y queso al horno', 490, 42, 26, 6, 3),
        SNACKS[5],
      ),
      sunday: day(
        meal('12:30', 'Asado de tira con ensalada', 'Tira de asado magra con ensalada mixta grande', 560, 44, 36, 5, 2),
        meal('19:00', 'Gazpacho con palta', 'Gazpacho frío de tomate con dados de palta y aceite de oliva', 320, 6, 20, 16, 6),
        SNACKS[6],
      ),
    },
  },
  {
    week_number: 12,
    season: 'spring',
    days: {
      monday: day(
        meal('12:30', 'Salmón con ensalada de pepino', 'Salmón rosado con pepino, eneldo, limón y aceite de oliva', 500, 34, 34, 6, 3),
        meal('19:00', 'Pollo a la mostaza con brócoli', 'Pechuga al horno con mostaza y brócoli al vapor', 460, 40, 24, 8, 5),
        SNACKS[0],
      ),
      tuesday: day(
        meal('12:30', 'Atún con tabulé de coliflor', 'Atún al natural con coliflor procesada, tomate, perejil, limón', 440, 36, 22, 10, 5),
        meal('19:00', 'Omelette de champignones y queso', '3 huevos con champignones, queso de cabra y pimienta', 440, 28, 32, 4, 2),
        SNACKS[2],
      ),
      wednesday: day(
        meal('12:30', 'Pollo grillado con palta y tomate', 'Pechuga con palta, tomate, lechuga y aderezo de limón', 500, 40, 30, 8, 5),
        meal('19:00', 'Merluza a la plancha con ensalada', 'Filet con ensalada de rúcula, rabanitos y pepino', 420, 36, 20, 6, 3),
        SNACKS[4],
      ),
      thursday: day(
        meal('12:30', 'Ensalada niçoise argentina', 'Atún, huevo duro, chauchas, tomate, aceitunas, anchoas', 490, 36, 30, 8, 4),
        meal('19:00', 'Zapallitos rellenos gratinados', 'Zapallitos con carne magra, cebolla y queso gratinado', 470, 34, 28, 12, 4),
        SNACKS[1],
      ),
      friday: day(
        meal('12:30', 'Lomo a la pimienta con espárragos', 'Medallones de lomo con pimienta negra y espárragos', 510, 44, 30, 6, 3),
        meal('19:00', 'Tarta sin masa de brócoli y queso', 'Brócoli, huevos, queso crema, cebolla en budinera', 420, 24, 28, 10, 5),
        SNACKS[3],
      ),
      saturday: day(
        meal('12:30', 'Trucha con almendras y ensalada', 'Trucha al horno con almendras y ensalada verde', 500, 38, 30, 6, 3),
        meal('19:00', 'Huevos revueltos con verduras', '3 huevos con espinaca, tomate cherry y aceite de oliva', 400, 22, 28, 6, 3),
        SNACKS[5],
      ),
      sunday: day(
        meal('12:30', 'Entraña a la parrilla con ensalada', 'Entraña con chimichurri y ensalada primaveral', 550, 44, 36, 5, 2),
        meal('19:00', 'Sopa fría de tomate y albahaca', 'Tomate, albahaca, aceite de oliva y queso rallado', 300, 8, 18, 16, 4),
        SNACKS[6],
      ),
    },
  },

  // ══════════════════════════════════════
  // VERANO - Semanas 13-16
  // ══════════════════════════════════════
  {
    week_number: 13,
    season: 'summer',
    days: {
      monday: day(
        meal('12:30', 'Ceviche de merluza veraniego', 'Merluza en limón con mango, cebolla morada, cilantro y ají', 380, 32, 16, 14, 4),
        meal('19:00', 'Pollo frío con ensalada', 'Pechuga grillada fría con lechuga, tomate, pepino y vinagreta', 440, 40, 22, 8, 4),
        SNACKS[0],
      ),
      tuesday: day(
        meal('12:30', 'Ensalada de salmón y palta', 'Salmón rosado, palta, pepino, rúcula, semillas de sésamo y limón', 520, 34, 36, 8, 5),
        meal('19:00', 'Gazpacho con huevo y atún', 'Gazpacho frío de tomate con atún desmenuzado y huevo picado', 400, 28, 20, 14, 4),
        SNACKS[2],
      ),
      wednesday: day(
        meal('12:30', 'Pollo con ensalada caprese', 'Pechuga grillada con tomate, muzzarella fresca, albahaca', 500, 42, 28, 8, 2),
        meal('19:00', 'Merluza fría con vinagreta', 'Filet de merluza frío con vinagreta de limón, pepino y eneldo', 400, 34, 20, 6, 3),
        SNACKS[4],
      ),
      thursday: day(
        meal('12:30', 'Bowl de atún veraniego', 'Atún al natural con palta, mango, pepino, semillas y limón', 480, 36, 28, 12, 5),
        meal('19:00', 'Ensalada de huevo y verduras', '3 huevos duros con chauchas, tomate cherry, aceitunas', 410, 22, 28, 8, 4),
        SNACKS[1],
      ),
      friday: day(
        meal('12:30', 'Bife frío con ensalada', 'Bife frío en fetas con rúcula, parmesano, tomate y limón', 520, 42, 32, 6, 3),
        meal('19:00', 'Wrap de lechuga con caballa', 'Hojas de lechuga con caballa, palta, zanahoria rallada', 430, 30, 28, 8, 4),
        SNACKS[3],
      ),
      saturday: day(
        meal('12:30', 'Trucha a la plancha con limón', 'Trucha con limón, alcaparras y ensalada de pepino', 470, 38, 26, 6, 3),
        meal('19:00', 'Ensalada griega', 'Tomate, pepino, aceitunas, queso feta, cebolla morada, orégano', 380, 14, 28, 10, 4),
        SNACKS[5],
      ),
      sunday: day(
        meal('12:30', 'Asado de vacío veraniego', 'Vacío magro con ensalada rusa sin papa (zanahoria, huevo, arvejas, mayo light)', 540, 44, 34, 8, 3),
        meal('19:00', 'Tomates rellenos fríos', 'Tomates rellenos de atún, huevo, aceitunas y mayonesa light', 360, 24, 22, 10, 4),
        SNACKS[6],
      ),
    },
  },
  {
    week_number: 14,
    season: 'summer',
    days: {
      monday: day(
        meal('12:30', 'Ensalada de pollo y frutos secos', 'Pollo grillado frío con almendras, nueces, lechuga, apio y limón', 510, 38, 34, 8, 5),
        meal('19:00', 'Merluza con salsa criolla', 'Filet a la plancha con salsa criolla fría de tomate, cebolla y morrón', 420, 36, 20, 8, 3),
        SNACKS[0],
      ),
      tuesday: day(
        meal('12:30', 'Carpaccio de carne con rúcula', 'Carne cruda en láminas finas con rúcula, parmesano, alcaparras y limón', 440, 36, 28, 4, 2),
        meal('19:00', 'Ensalada de caballa y pepino', 'Caballa con pepino, tomate cherry, cebolla morada y aceite de oliva', 450, 32, 28, 8, 3),
        SNACKS[2],
      ),
      wednesday: day(
        meal('12:30', 'Bowl de salmón y palta', 'Salmón rosado con palta, rúcula, semillas, pepino y sésamo', 530, 34, 36, 8, 5),
        meal('19:00', 'Tortilla fría de verduras', 'Tortilla fría de 3 huevos con zapallito y morrón', 420, 24, 28, 10, 4),
        SNACKS[4],
      ),
      thursday: day(
        meal('12:30', 'Pollo a la naranja con ensalada', 'Pechuga fría marinada en naranja con ensalada verde y nueces', 490, 40, 26, 10, 4),
        meal('19:00', 'Atún con ensalada de apio y palta', 'Atún al natural con apio, palta, limón y pimienta', 450, 36, 28, 6, 4),
        SNACKS[1],
      ),
      friday: day(
        meal('12:30', 'Lomo frío con vegetales', 'Lomo frío en láminas con berenjena grillada, morrón y rúcula', 500, 42, 30, 8, 4),
        meal('19:00', 'Huevos rellenos con verduras', '4 mitades rellenas con palta, cebolla de verdeo y pimienta', 380, 18, 28, 6, 4),
        SNACKS[3],
      ),
      saturday: day(
        meal('12:30', 'Merluza con pesto de albahaca', 'Filet al horno con pesto de albahaca y nueces, tomate cherry', 480, 36, 28, 8, 3),
        meal('19:00', 'Ensalada grande de verano', 'Lechuga, tomate, pepino, zanahoria, huevo, aceitunas, queso', 400, 18, 26, 12, 5),
        SNACKS[5],
      ),
      sunday: day(
        meal('12:30', 'Costillas al limón y hierbas', 'Costillas de cerdo al horno con limón, romero y ensalada', 560, 40, 38, 6, 2),
        meal('19:00', 'Vichyssoise de puerro sin papa', 'Crema fría de puerro con coliflor, cebolla y aceite de oliva', 300, 8, 18, 14, 5),
        SNACKS[6],
      ),
    },
  },
  {
    week_number: 15,
    season: 'summer',
    days: {
      monday: day(
        meal('12:30', 'Atún fresco a la plancha', 'Atún a la plancha con ensalada de rúcula, tomate cherry y palta', 510, 40, 30, 6, 4),
        meal('19:00', 'Pollo frío desmenuzado', 'Pollo desmenuzado con pepino, zanahoria rallada, limón y pimienta', 420, 38, 20, 8, 4),
        SNACKS[0],
      ),
      tuesday: day(
        meal('12:30', 'Ensalada de merluza y huevo', 'Merluza grillada con 2 huevos duros, lechuga, tomate y aceite', 460, 38, 26, 6, 3),
        meal('19:00', 'Berenjenas rellenas frías', 'Berenjenas rellenas de atún, tomate, aceitunas y queso', 440, 28, 28, 12, 5),
        SNACKS[2],
      ),
      wednesday: day(
        meal('12:30', 'Pollo con taboulé de coliflor', 'Pechuga grillada con coliflor procesada, perejil, tomate, limón', 470, 42, 22, 10, 5),
        meal('19:00', 'Caballa con ensalada de pepino', 'Caballa en lata con pepino, rabanitos, eneldo y limón', 430, 30, 26, 8, 3),
        SNACKS[4],
      ),
      thursday: day(
        meal('12:30', 'Salmón rosado con verduras frescas', 'Salmón rosado con palta, pepino, lechuga y semillas', 520, 34, 36, 8, 5),
        meal('19:00', 'Revuelto frío de huevos', '3 huevos revueltos fríos con tomate, albahaca y aceite', 400, 22, 28, 6, 2),
        SNACKS[1],
      ),
      friday: day(
        meal('12:30', 'Bife con chimichurri y vegetales', 'Bife angosto con chimichurri y vegetales grillados', 540, 44, 34, 6, 3),
        meal('19:00', 'Ensalada de pollo y nueces', 'Pollo frío con nueces, apio, lechuga y limón', 470, 36, 30, 6, 3),
        SNACKS[3],
      ),
      saturday: day(
        meal('12:30', 'Trucha con ensalada de hinojo', 'Trucha grillada con hinojo, naranja y rúcula', 480, 38, 26, 10, 4),
        meal('19:00', 'Tarta sin masa de verduras verdes', 'Espinaca, brócoli, zucchini, huevos y queso al horno', 420, 24, 28, 10, 6),
        SNACKS[5],
      ),
      sunday: day(
        meal('12:30', 'Asado de entraña veraniego', 'Entraña a la parrilla con ensalada de tomate y cebolla', 550, 44, 36, 5, 2),
        meal('19:00', 'Gazpacho andaluz', 'Tomate, pepino, morrón, ajo, aceite de oliva y vinagre', 280, 4, 16, 16, 5),
        SNACKS[6],
      ),
    },
  },
  {
    week_number: 16,
    season: 'summer',
    days: {
      monday: day(
        meal('12:30', 'Merluza con salsa de palta', 'Filet a la plancha con salsa de palta, limón y cilantro', 480, 36, 30, 8, 5),
        meal('19:00', 'Ensalada de pollo y palta', 'Pollo grillado frío con palta, tomate cherry y rúcula', 460, 38, 28, 6, 4),
        SNACKS[0],
      ),
      tuesday: day(
        meal('12:30', 'Atún a la provenzal', 'Atún al natural con ajo, perejil, tomate y ensalada verde', 440, 36, 24, 8, 3),
        meal('19:00', 'Omelette de palta y tomate', '3 huevos con palta, tomate y queso de cabra', 460, 26, 34, 6, 4),
        SNACKS[2],
      ),
      wednesday: day(
        meal('12:30', 'Pollo al pesto con tomate', 'Pechuga con pesto de albahaca y nueces, tomate cherry', 510, 40, 30, 8, 3),
        meal('19:00', 'Caballa con ensalada fresca', 'Caballa con lechuga, pepino, zanahoria rallada y limón', 420, 30, 24, 8, 4),
        SNACKS[4],
      ),
      thursday: day(
        meal('12:30', 'Bowl de salmón veraniego', 'Salmón rosado con pepino, palta, rúcula y semillas de chía', 520, 34, 36, 8, 6),
        meal('19:00', 'Huevos al plato con tomate', '3 huevos al horno en salsa de tomate, orégano y queso', 430, 24, 28, 12, 3),
        SNACKS[1],
      ),
      friday: day(
        meal('12:30', 'Cerdo con ensalada de repollo', 'Bifecitos de cerdo con ensalada de repollo, zanahoria y limón', 500, 38, 30, 10, 4),
        meal('19:00', 'Ensalada de atún y chauchas', 'Atún con chauchas, tomate cherry, huevo y aceite de oliva', 430, 32, 24, 8, 4),
        SNACKS[3],
      ),
      saturday: day(
        meal('12:30', 'Trucha con palta y limón', 'Trucha a la plancha con palta machacada y limón', 500, 38, 32, 6, 4),
        meal('19:00', 'Ensalada caprese con nueces', 'Tomate, muzzarella, albahaca, nueces y aceite de oliva', 420, 18, 32, 10, 3),
        SNACKS[5],
      ),
      sunday: day(
        meal('12:30', 'Vacío a la parrilla de verano', 'Vacío magro con chimichurri y ensalada fresca completa', 560, 46, 36, 4, 2),
        meal('19:00', 'Sopa fría de pepino y palta', 'Pepino, palta, limón, menta y aceite de oliva fríos', 300, 6, 22, 10, 5),
        SNACKS[6],
      ),
    },
  },
];

export function getMealPlans(): WeekMealPlan[] {
  return WEEK_TEMPLATES;
}

export function getMealPlanForWeek(weekNumber: number): WeekMealPlan | undefined {
  const index = ((weekNumber - 1) % WEEK_TEMPLATES.length);
  return WEEK_TEMPLATES[index];
}

export function getCurrentWeekNumber(startDate: string): number {
  const start = new Date(startDate);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(1, Math.floor(diffDays / 7) + 1);
}

export function getDayName(date: Date): keyof WeekMealPlan['days'] {
  const days: (keyof WeekMealPlan['days'])[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[date.getDay()];
}

export function getTodaysMeals(startDate: string): DayMealPlan | null {
  const weekNum = getCurrentWeekNumber(startDate);
  const plan = getMealPlanForWeek(weekNum);
  if (!plan) return null;

  const dayName = getDayName(new Date());
  return plan.days[dayName];
}
