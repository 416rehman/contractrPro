CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"amount" numeric NOT NULL,
	"method" text NOT NULL,
	"reference" text,
	"description" text,
	"date" timestamp DEFAULT now(),
	"stripe_payment_intent_id" text,
	"stripe_charge_id" text,
	"invoice_id" uuid,
	"expense_id" uuid,
	"contract_id" uuid,
	"organization_id" uuid NOT NULL,
	"recorded_by_user_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tax_rates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"rate" numeric NOT NULL,
	"description" text,
	"is_default" boolean DEFAULT false,
	"organization_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "time_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hours" numeric NOT NULL,
	"date" timestamp NOT NULL,
	"description" text,
	"job_id" uuid NOT NULL,
	"organization_member_id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "invites" DROP CONSTRAINT "invites_for_organization_member_id_organization_members_id_fk";
--> statement-breakpoint
ALTER TABLE "expenses" ADD COLUMN "receipt_url" text;--> statement-breakpoint
ALTER TABLE "invites" ADD COLUMN "reserved_member_id" uuid;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "stripe_payment_intent_id" text;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "stripe_checkout_session_id" text;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "payment_url" text;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "payment_token" text;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "address" text;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "latitude" numeric;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "longitude" numeric;--> statement-breakpoint
ALTER TABLE "organization_members" ADD COLUMN "hourly_rate" numeric;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "stripe_account_id" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "stripe_onboarded" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_expense_id_expenses_id_fk" FOREIGN KEY ("expense_id") REFERENCES "public"."expenses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_contract_id_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_recorded_by_user_id_users_id_fk" FOREIGN KEY ("recorded_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tax_rates" ADD CONSTRAINT "tax_rates_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_organization_member_id_organization_members_id_fk" FOREIGN KEY ("organization_member_id") REFERENCES "public"."organization_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invites" ADD CONSTRAINT "invites_reserved_member_id_organization_members_id_fk" FOREIGN KEY ("reserved_member_id") REFERENCES "public"."organization_members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invites" DROP COLUMN "for_organization_member_id";