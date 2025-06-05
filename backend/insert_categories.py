"""
Script para inserir categorias alemãs no banco de dados
"""

from db import verbinden, verbindung_schliessen

def inserir_categorias():
    """
    Insere as categorias alemãs no banco de dados
    """
    verbindung = None
    cursor = None
    try:
        verbindung = verbinden()
        if not verbindung:
            print("Erro ao conectar com o banco de dados")
            return False

        cursor = verbindung.cursor()
        
        # Categorias a serem inseridas
        categorias = [
            ('Vorspeise', 'Appetizers and starters'),
            ('Hauptgericht', 'Main dishes and entrees'),
            ('Nachspeise', 'Desserts and sweet treats'),
            ('Snack', 'Small bites and appetizers'),
            ('Alkoholfreie Getränke', 'Non-alcoholic beverages'),
            ('Alkoholische Getränke', 'Alcoholic beverages')
        ]
        
        # Inserir cada categoria
        for name, beschreibung in categorias:
            sql = "INSERT IGNORE INTO kategorien (name, beschreibung) VALUES (%s, %s)"
            cursor.execute(sql, (name, beschreibung))
            print(f"Categoria '{name}' inserida")
        
        verbindung.commit()
        print("Todas as categorias foram inseridas com sucesso!")
        return True
        
    except Exception as fehler:
        print(f"Erro ao inserir categorias: {fehler}")
        return False
        
    finally:
        if cursor:
            cursor.close()
        if verbindung:
            verbindung_schliessen(verbindung)

if __name__ == "__main__":
    inserir_categorias() 