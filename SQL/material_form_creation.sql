SELECT M.id, M.name as material_name, M.price_for_m3 as material_price
FROM public."Creations" AS C
         JOIN public."Materials" AS M ON C.material_id = M.id
WHERE C.name = 'название_изделия';
