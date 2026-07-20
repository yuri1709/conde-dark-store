export interface Product {
    id: string;
    name: string;    
    qtd: number;
    price: number;
    img: string;
    avaible: boolean;
    ammoPackSize: 'standard'| 'extended'| 'tactical'| 'combat'| 'arsenal';
    ammoType: '14mm'|'12mm'|'9mm'|'10g'|'12g'|'55handgun'|'heavyGrenades'|'energy'|'gasoline'|'ammoMaterials';
}