import { db } from './src/lib/server/db/index.js';
import { sql } from 'drizzle-orm';

async function setup() {
    await db.execute(sql`
		CREATE OR REPLACE FUNCTION articles_search_vector_update() RETURNS trigger AS $$
		BEGIN
		  new.search_vector := to_tsvector('english', new.title || ' ' || COALESCE(new.content_text, ''));
		  RETURN new;
		END
		$$ LANGUAGE plpgsql;
	`);

    await db.execute(sql`
		DROP TRIGGER IF EXISTS articles_search_vector_trigger ON articles;
		CREATE TRIGGER articles_search_vector_trigger
		BEFORE INSERT OR UPDATE ON articles
		FOR EACH ROW EXECUTE FUNCTION articles_search_vector_update();
	`);

    console.log('Search trigger setup complete');
    process.exit(0);
}

setup();
