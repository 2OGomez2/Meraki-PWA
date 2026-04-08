export const MENU_ESTRUCTURADO = [
  {
    categoria: "Bebidas",
    icono: "CupSoda",
    subcategorias: [
      {
        nombre: "Sodas Italianas",
        productos: [
          { id: 101, nombre: "Toronja-Fresa", precioBase: 2.00, modificadores: [] },
          { id: 102, nombre: "Toronja-Fresa-Limon", precioBase: 2.00, modificadores: [] },
          { id: 103, nombre: "Soda Mora-Fresa", precioBase: 2.25, modificadores: [] },
          { id: 104, nombre: "Blue Limon Soda", precioBase: 2.50, modificadores: [] }

        ]
      },
      {
        nombre: "Limonadas",
        productos: [
          { id: 105, nombre: "Natural", precioBase: 2.00, modificadores: [] },
          { id: 106, nombre: "Fresa", precioBase: 2.50, modificadores: [] },
          { id: 107, nombre: "Maracuya", precioBase: 2.00, modificadores: [] }
        ]
      },
      {
        nombre: "Té Durazno",
        productos: [
          { id: 108, nombre: "Durazno", precioBase: 2.00, modificadores: [{nombre: "Tapiocas", precioEfecto: 1.00}] }
        ]
      },
      {
        nombre: "Bobas",
        productos: [
          { id: 109, nombre: "Taro", precioBase: 3.50, modificadores: [] },
          { id: 110, nombre: "Chicle", precioBase: 3.50, modificadores: [] },
          { id: 111, nombre: "Té Chai", precioBase: 3.50, modificadores: [] },
          { id: 112, nombre: "Té Thai", precioBase: 3.50, modificadores: [] },
          { id: 113, nombre: "Fresa", precioBase: 3.50, modificadores: [] },
          { id: 114, nombre: "Mango-Coco", precioBase: 3.50, modificadores: [] },
          { id: 115, nombre: "Brown Sugar", precioBase: 3.50, modificadores: [] }
        ]
      },
      {
        nombre: "Café Helado",
        productos: [
          { id: 116, nombre: "Café Helado Mocca", precioBase: 2.50, modificadores: [] },
          { id: 117, nombre: "Café Helado Caramelo", precioBase: 3.00, modificadores: [] },
          { id: 118, nombre: "Café Helado Vainilla", precioBase: 3.00, modificadores: [] },
          { id: 119, nombre: "Café Helado Pistacho", precioBase: 3.00, modificadores: [] },
          { id: 120, nombre: "Americano Helado", precioBase: 2.50, modificadores: [] }
        ]
      },
      {
        nombre: "Café Caliente",
        productos: [
          { id: 121, nombre: "Café Americano", precioBase: 2.00, modificadores: [{nombre: "Leche", precioEfecto: 0.50}] },
          { id: 122, nombre: "Capuchino Tradicional", precioBase: 2.50, modificadores: [] },
          { id: 123, nombre: "Capuchino Mocca", precioBase: 3.00, modificadores: [] },
          { id: 124, nombre: "Capuchino Caramelo", precioBase: 3.00, modificadores: [] },
          { id: 125, nombre: "Capuchino vainilla", precioBase: 3.00, modificadores: [] },
          { id: 142, nombre: "Té Chai Caliente", precioBase: 2.50, modificadores: [] }
        ]
      },
       {
        nombre: "FRAPPE",
        productos: [
          { id: 126, nombre: "Oreo", precioBase: 3.25, modificadores: [] },
          { id: 127, nombre: "Fresa", precioBase: 3.25, modificadores: [] },
          { id: 128, nombre: "Fresa Natural", precioBase: 3.50, modificadores: [] },
          { id: 129, nombre: "Nutella", precioBase: 3.50, modificadores: [] },
          { id: 130, nombre: "Café Mocca", precioBase: 3.50, modificadores: [] },
          { id: 131, nombre: "Café Caramelo", precioBase: 3.50, modificadores: [] },
          { id: 132, nombre: "Oreo-Café", precioBase: 3.50, modificadores: [] },
          { id: 133, nombre: "Mora", precioBase: 3.50, modificadores: [] },
          { id: 134, nombre: "Pistacho", precioBase: 3.50, modificadores: [] },
          { id: 135, nombre: "Coco", precioBase: 3.50, modificadores: [] },
          { id: 136, nombre: "Coco Fresa Boba", precioBase: 4.50, modificadores: [] },
          { id: 137, nombre: "Coco Boba", precioBase: 4.00, modificadores: [] },
        ]
      },
       {
        nombre: "Licuados",
        productos: [
          { id: 138, nombre: "Oreo", precioBase: 2.50, modificadores: [] },
          { id: 139, nombre: "Fresa", precioBase: 2.50, modificadores: [] },
          { id: 140, nombre: "Banano", precioBase: 2.00, modificadores: [] },
          { id: 141, nombre: "Avena-Banano", precioBase: 2.50, modificadores: [] }
        ]
      }
    ]
  },
  {
    categoria: "Hamburguesas y Sandwich",
    icono: "Utensils",
    subcategorias: [
      {
        nombre: "Hamburguesas Res",
        productos: [
          { id: 201, nombre: "Tradicional-Papas", precioBase: 5.00, modificadores: [] },
          { id: 202, nombre: "Doble Carne-Doble Queso-Papas", precioBase: 6.50, modificadores: [] },
          { id: 203, nombre: "Carnivora-Papas", precioBase: 7.50, modificadores: [] },
          { id: 204, nombre: "3 aderezos-Papas", precioBase: 5.25, modificadores: [] }
        ]
      },
      {
        nombre: "Hamburguesas Pollo",
        productos: [
          { id: 205, nombre: "Tradicional-Papas", precioBase: 5.25, modificadores: [] },
          { id: 206, nombre: "Doble Pollo-Doble Queso-Papas", precioBase: 6.25, modificadores: [] },
          { id: 207, nombre: "Mixta Res-Pollo+Papas", precioBase: 6.25, modificadores: [] },
          { id: 208, nombre: "3 aderezos-Papas", precioBase: 5.25, modificadores: [] }
        ]
      },
      {
        nombre: "Sandwich",
        productos: [
          { id: 209, nombre: "Sandwich de jamos", precioBase: 2.00, modificadores: [{nombre: "Papas", precioEfecto: 1.00}] },
        ]
      }
    ]
  },
  {
    categoria: "Papas,Dedos de queso y Rollitos ",
    icono: "Utensils",
    subcategorias: [
      {
        nombre: "Papas Fritas",
        productos: [
          { id: 230, nombre: "Tradicionales", precioBase: 2.00, modificadores: [] },
          { id: 231, nombre: "Salchipapas", precioBase: 4.50, modificadores: [] },
          { id: 232, nombre: "Papa carnivora", precioBase: 5.00, modificadores: [] },
          { id: 233, nombre: "Papachedar", precioBase: 4.00, modificadores: [] }
        ]
      },
      {
        nombre: "Deditos de queso",
        productos: [
          { id: 234, nombre: "6 deditos+papas", precioBase: 4.50, modificadores: [] },
          { id: 235, nombre: "12 deditos+papas", precioBase: 8.50, modificadores: [] },
          { id: 236, nombre: "Papa carnivora", precioBase: 5.00, modificadores: [] },
          { id: 237, nombre: "Papachedar", precioBase: 4.00, modificadores: [] }
        ]
      },
      {
        nombre: "Rollitos y Dumpling",
        productos: [
          { id: 238, nombre: "Rollito Primavera (4 Rollitos+Salsa Teriyaki)", precioBase: 5.00, modificadores: [] },
          { id: 239, nombre: "Dumpling (12+soya)", precioBase: 4.50, modificadores: [] }
        ]
      }
      
    ]
  },
  {
    categoria: "Alitas",
    icono: "Utensils",
    subcategorias: [
      {
        nombre: "Combos de Alitas",
        productos: [
          { 
            id: 238, 
            nombre: "Combo 1 (6 alitas + papas)", 
            precioBase: 5.00, 
            maxAderezosGratis: 1, 
            aderezosDisponibles: ["BBQ", "Búfalo", "Ranch", "Orange"] 
          },
          { 
            id: 239, 
            nombre: "Combo 2 (12 alitas + papas)", 
            precioBase: 9.00, 
            maxAderezosGratis: 2, 
            aderezosDisponibles: ["BBQ", "Búfalo", "Ranch", "Orange"] 
          }
        ]
      }
    ]
  }
];