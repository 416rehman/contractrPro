ALTER TABLE "organization_members" ADD CONSTRAINT "org_user_unique" UNIQUE("organization_id","user_id");--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "org_email_unique" UNIQUE("organization_id","email");--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "org_phone_unique" UNIQUE("organization_id","phone");