import { db } from '$lib/server/db';
import { sql } from 'drizzle-orm';
import { json } from '@sveltejs/kit';

export async function GET() {
    try {
        // Create the update function
        await db.execute(sql`
			CREATE OR REPLACE FUNCTION articles_search_vector_update() RETURNS trigger AS $$
			BEGIN
			  new.search_vector := to_tsvector('english', new.title || ' ' || COALESCE(new.content_text, ''));
			  RETURN new;
			END
			$$ LANGUAGE plpgsql;
		`);

        // Create the trigger
        await db.execute(sql`
			DROP TRIGGER IF EXISTS articles_search_vector_trigger ON articles;
			CREATE TRIGGER articles_search_vector_trigger
			BEFORE INSERT OR UPDATE ON articles
			FOR EACH ROW EXECUTE FUNCTION articles_search_vector_update();
		`);

        // Backfill existing data
        await db.execute(sql`
            UPDATE articles 
            SET search_vector = to_tsvector('english', title || ' ' || COALESCE(content_text, ''))
            WHERE search_vector IS NULL;
        `);

        return json({ success: true, message: 'Search triggers and indices setup complete' });
    } catch (error: any) {
        return json({ success: false, error: error.message }, { status: 500 });
    }
}
