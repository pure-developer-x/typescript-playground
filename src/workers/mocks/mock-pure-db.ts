import {
  Kysely,
  Driver,
  DatabaseConnection,
  PostgresAdapter,
  PostgresIntrospector,
  PostgresQueryCompiler,
  TransactionSettings,
  DummyDriver,
} from "kysely";
import { PureLogger } from "@/workers/pure-logger";
import { hashObject } from "@/lib/hash";
import { EvaluationContext } from "@/hooks/useEvalContext";

class PureKyselyDriver implements Driver {
  logger = PureLogger.instance;
  constructor(private context: EvaluationContext, private driver: Driver) { }

  async init(): Promise<void> { }

  async acquireConnection(): Promise<DatabaseConnection> {
    const connection = await this.driver.acquireConnection();
    return {
      executeQuery: async (compiled) => {
        if (!compiled) {
          throw new Error("Compiled query is undefined");
        }
        const hash = await hashObject(compiled);

        this.logger.send({ type: "sql", compiled, hash });

        if (this.context.sqlMocks[hash]) {
          return this.context.sqlMocks[hash].value.results;
        }
        return connection.executeQuery(compiled);
      },
      streamQuery: (query) => {
        return connection.streamQuery(query);
      },
    };
  }
  async releaseConnection(connection: DatabaseConnection): Promise<void> {
    return this.driver.releaseConnection(connection);
  }

  async beginTransaction(
    connection: DatabaseConnection,
    settings: TransactionSettings
  ): Promise<void> {
    return this.driver.beginTransaction(connection, settings);
  }

  async commitTransaction(connection: DatabaseConnection): Promise<void> {
    return this.driver.commitTransaction(connection);
  }

  async rollbackTransaction(connection: DatabaseConnection): Promise<void> {
    return this.driver.rollbackTransaction(connection);
  }

  async destroy(): Promise<void> {
    return this.driver.destroy();
  }
}

export class MockDB {
  constructor(public kysely: Kysely<unknown>) { }

  clearDatabase() { }


  static create(context: EvaluationContext) {
    const kysely = new Kysely<unknown>({
      dialect: {
        createAdapter() {
          return new PostgresAdapter();
        },
        createDriver() {
          return new PureKyselyDriver(context, new DummyDriver());
        },
        createIntrospector(db: Kysely<unknown>) {
          return new PostgresIntrospector(db);
        },
        createQueryCompiler() {
          return new PostgresQueryCompiler();
        },
      },
    });

    return new MockDB(kysely);
  }
}
