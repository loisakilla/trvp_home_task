SELECT C.id, C.name, C.price
FROM public."Creations" AS C
         JOIN public."Materials" AS M ON C.material_id = M.id
WHERE M.name = 'название_материала';
